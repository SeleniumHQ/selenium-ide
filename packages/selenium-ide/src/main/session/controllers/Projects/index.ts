import { ProjectShape } from '@seleniumhq/side-model'
import defaultProject from 'api/models/project'
import { promises as fs } from 'fs'
import Api from 'main/api'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'
import RecentProjects from './Recent'

export default class ProjectsController {
  constructor(session: Session) {
    this.session = session
    this.recentProjects = new RecentProjects(session)
    this.project = defaultProject
  }
  filepath?: string
  recentProjects: RecentProjects
  project: ProjectShape
  session: Session

  async close(): Promise<void> {
    await this.session.windows.closeAll()
  }

  async onProjectLoaded(project: ProjectShape, filepath?: string): Promise<void> {
    const {
      session: { commands, menu, windows },
    } = this
    commands.init()
    this.filepath = filepath
    this.session.api = await Api(this.session)
    this.session.driver.build({});
    await menu.onProjectLoaded()
    await windows.onProjectLoaded()
    this.project = project
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
    this.onProjectLoaded(project, filepath)
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
