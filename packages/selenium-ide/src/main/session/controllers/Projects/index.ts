import { ProjectShape } from '@seleniumhq/side-model'
import { project as defaultProject, CoreSessionData } from '@seleniumhq/side-api'
import { promises as fs } from 'fs'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'
import RecentProjects from './Recent'
import BaseController from '../Base'

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

  async executeHook(
    hookName: keyof Pick<
      BaseController,
      'onProjectLoaded' | 'onProjectUnloaded'
    >
  ): Promise<void> {
    await Promise.all(
      Object.values(this.session)
        .filter((v) => v.isController)
        .map((v) => v[hookName]())
    )
  }

  async onProjectLoaded(
    project: ProjectShape,
    filepath?: string
  ): Promise<void> {
    if (this.loaded) return
    this.filepath = filepath
    this.project = project
    await this.executeHook('onProjectLoaded')
    this.loaded = true
  }

  async onProjectUnloaded(): Promise<boolean> {
    if (!this.loaded) return true
    const confirm = await this.doSaveChangesConfirm()
    if (confirm) {
      await this.executeHook('onProjectUnloaded')
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

  async new(): Promise<ProjectShape | null> {
    if (this.loaded) {
      const confirm = await this.onProjectUnloaded()
      if (!confirm) {
        return null
      }
    }
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
    await this.onProjectLoaded(starterProject)
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
      await this.onProjectLoaded(loadedProject, filepath)
      return await this.session.state.get()
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
