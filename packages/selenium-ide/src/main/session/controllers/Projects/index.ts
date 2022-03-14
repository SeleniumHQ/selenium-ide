import { ProjectShape } from '@seleniumhq/side-model'
import defaultProject from 'api/models/project'
import { BrowserWindow } from 'electron'
import { promises as fs } from 'fs'
import { Session } from 'main/types'
import { join } from 'path'
import RecentProjects from './Recent'
import { randomUUID } from 'crypto'

const mainWindowNames = ['playback-window', 'project-editor']
const childWindowNames = ['playback-controls']
export default class ProjectsController {
  constructor(session: Session) {
    this.session = session
    this.recentProjects = new RecentProjects(session)
    this.project = defaultProject
  }
  recentProjects: RecentProjects
  project: ProjectShape
  session: Session

  async onProjectLoaded(project: ProjectShape): Promise<void> {
    const {
      session: { commands, windows },
    } = this
    commands.init()
    this.project = project
    windows.close('splash')
    await Promise.all(
      mainWindowNames
        .concat(childWindowNames)
        .map((name: string) => windows.open(name))
    )
    const mainWindows = await Promise.all(
      mainWindowNames.map((name) => windows.get(name))
    )
    const [playbackWindow, commandEditor] = mainWindows
    playbackWindow.webContents.setWindowOpenHandler((details) => {
      this.session.recorder.handleNewWindow(details)
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            preload: join(__dirname, `playback-window-preload-bundle.js`),
          },
        },
      }
    })
    const childWindows = await Promise.all(
      childWindowNames.map((name) => windows.get(name))
    )
    mainWindows.forEach((mainWindow) => {
      mainWindow.on('focus', () => {
        childWindows.forEach((win) => {
          win.showInactive()
        })
      })
      mainWindow.on('blur', () => {
        const windows = BrowserWindow.getAllWindows()
        const anyWindowFocused = windows.reduce((focused, window) => {
          if (focused) return true
          return window.isFocused()
        }, false)
        if (!anyWindowFocused) {
          childWindows.forEach((win) => {
            win.hide()
          })
        }
      })
    })
    playbackWindow.on('closed', () => {
      commandEditor.destroy()
      childWindows.forEach((win) => {
        win.destroy()
      })
    })
  }

  async getActive(): Promise<ProjectShape> {
    return this.project as ProjectShape
  }

  async getRecent(): Promise<string[]> {
    return this.recentProjects.get()
  }

  async new(): Promise<ProjectShape> {
    const testID = randomUUID()
    const starterProject: ProjectShape = {
      id: randomUUID(),
      version: '3.0',
      name: 'New Project',
      url: 'http://www.google.com',
      urls: ['http://www.google.com'],
      plugins: [],
      suites: [
        {
          id: randomUUID(),
          name: 'New Suite',
          parallel: false,
          persistSession: false,
          tests: [testID],
          timeout: 30000,
        },
      ],
      tests: [
        {
          id: testID,
          name: 'New Test',
          commands: [
            {
              id: randomUUID(),
              command: 'open',
              target: '/',
              value: '',
            },
          ],
        },
      ],
      snapshot: {
        dependencies: {},
        tests: [],
        jest: {
          extraGlobals: [],
        },
      },
    }
    this.onProjectLoaded(starterProject)
    return starterProject
  }

  async load(filepath: string): Promise<ProjectShape> {
    const project = await this.load_v3(filepath)
    this.onProjectLoaded(project)
    return project
  }

  async save(filepath: string): Promise<boolean> {
    return this.save_v3(filepath)
  }

  async update(
    _updates: Partial<Pick<ProjectShape, 'name' | 'url'>>
  ): Promise<boolean> {
    return true
  }

  async load_v3(filepath: string): Promise<ProjectShape> {
    const fileContents = await fs.readFile(filepath, 'utf-8')
    this.recentProjects.add(filepath)
    return JSON.parse(fileContents)
  }
  async save_v3(filepath: string): Promise<boolean> {
    await fs.writeFile(filepath, JSON.stringify(this.project, undefined, 2))
    this.recentProjects.add(filepath)
    return true
  }
}
