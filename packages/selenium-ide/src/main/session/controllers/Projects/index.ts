import { ProjectShape } from '@seleniumhq/side-model'
import defaultProject from 'api/models/project'
import defaultState from 'api/models/state'
import { promises as fs } from 'fs'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'
import RecentProjects from './Recent'
import { CoreSessionData, StateShape } from 'api/types'
import storage from 'main/store'

export default class ProjectsController {
  constructor(session: Session) {
    this.session = session
    this.recentProjects = new RecentProjects(session)
    this.project = defaultProject
  }
  filepath?: string
  loaded = false
  recentProjects: RecentProjects
  project: ProjectShape
  session: Session

  async onProjectLoaded(
    project: ProjectShape,
    filepath?: string
  ): Promise<void> {
    if (this.loaded) return
    const {
      session: { commands, menus, plugins, windows },
    } = this
    this.filepath = filepath
    this.project = project
    // First we need to load any custom commands and hooks
    await plugins.onProjectLoaded()
    // Next we need to load our full command list into state
    await commands.onProjectLoaded()
    // Set up our application menu
    await menus.onProjectLoaded()
    // Display our playback and editor windows
    await windows.onProjectLoaded()
    this.loaded = true
  }

  async onProjectUnloaded(): Promise<boolean> {
    const {
      session: { plugins, state },
    } = this
    if (!this.loaded) return true

    const confirm = await this.doSaveChangesConfirm()
    if (confirm) {
      // Cleanup our plugins
      plugins.onProjectUnloaded()
      // Cleanup our state
      state.onProjectUnloaded()

      delete this.filepath
      this.loaded = false
    }
    return confirm
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

  async load(filepath: string): Promise<CoreSessionData | null> {
    const loadedProject = await this.load_v3(filepath)
    if (loadedProject) {
      if (this.loaded) {
        const confirm = await this.onProjectUnloaded()
        if (!confirm) {
          return null
        }
      }
      const loadedState = storage.get(
        `projectStates.${loadedProject.id}`,
        defaultState
      ) as StateShape

      this.onProjectLoaded(loadedProject, filepath)
      const loadedSessionData: CoreSessionData = {
        project: loadedProject,
        state: loadedState,
      }
      return loadedSessionData
    }
    return null
  }

  async save(filepath: string): Promise<boolean> {
    return this.save_v3(filepath)
  }

  async select(useArgs = false): Promise<void> {
    // When we're opened with a side file in the path
    let argsFilepath = process.argv[1]
    if (!this.session.app.isPackaged) {
      const mainArgIndex = process.argv.findIndex((arg) =>
        arg.endsWith('main-bundle.js')
      )
      if (mainArgIndex === -1) {
        argsFilepath = ''
      } else argsFilepath = process.argv[mainArgIndex + 1]
    }
    if (this.filepath) {
      await this.load(this.filepath)
    } else if (useArgs && argsFilepath) {
      await this.load(argsFilepath)
    } else {
      await this.session.windows.open('splash')
    }
  }

  async update(
    _updates: Partial<Pick<ProjectShape, 'name' | 'url'>>
  ): Promise<boolean> {
    return true
  }

  async load_v3(filepath: string): Promise<ProjectShape | null> {
    const fileContents = await fs.readFile(filepath, 'utf-8')
    this.recentProjects.add(filepath)
    let project: ProjectShape
    try {
      project = JSON.parse(fileContents)

      project.plugins = project.plugins.filter(
        (plugin) => typeof plugin === 'string'
      )
      return project
    } catch (e) {
      console.log((e as Error).message)
      return null
    }
  }
  async save_v3(filepath: string): Promise<boolean> {
    await fs.writeFile(filepath, JSON.stringify(this.project, undefined, 2))
    this.recentProjects.add(filepath)
    this.session.projects.filepath = filepath
    return true
  }

  async doSaveChangesConfirm(): Promise<boolean> {
    if (await this.projectHasChanged()) {
      const confirmationStatus = await this.session.dialogs.showMessageBox(
        'Save changes before leaving?',
        ['Cancel', 'Save and Continue', 'Continue without Saving']
      )
      switch (confirmationStatus) {
        case 0:
          return false
        case 1:
          await this.session.projects.save(
            this.session.projects.filepath as string
          )
      }
    }
    return true
  }

  async projectHasChanged(): Promise<boolean> {
    if (!this.filepath) return true

    const fileContents = await fs.readFile(this.filepath, 'utf-8')
    const currentProject = JSON.stringify(this.project, undefined, 2)
    return fileContents != currentProject
  }
}
