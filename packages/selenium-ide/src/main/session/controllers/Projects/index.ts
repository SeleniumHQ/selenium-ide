import { ProjectShape } from '@seleniumhq/side-model'
import { promises as fs } from 'fs'
import { Session } from 'main/types'
import defaultProject from 'api/models/project'
import RecentProjects from './Recent'
import { BrowserWindow } from 'electron'

const windowNames = [
  'playback-window',
  'test-manager',
  'command-controls',
  'playback-controls',
]
const mainWindowName = windowNames[0]
const childWindowNames = windowNames.slice(1)
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
    await Promise.all(windowNames.map((name: string) => windows.open(name)))
    const mainWindow = await windows.get(mainWindowName)
    const childWindows = await Promise.all(
      childWindowNames.map((name) => windows.get(name))
    )
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
    mainWindow.on('closed', () => {
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
    const starterProject: ProjectShape = {
      id: '',
      version: '3.0',
      name: 'New Project',
      url: 'http://www.google.com',
      urls: ['http://www.google.com'],
      plugins: [],
      suites: [],
      tests: [],
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
