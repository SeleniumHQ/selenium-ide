import * as projectEditorConfig from 'browser/panels/ProjectEditor/config'
import { promises as fs } from 'fs'
import { Session } from 'main/types'
import { ProjectShape } from 'api/types'
import RecentProjects from './Recent'

export default class ProjectsController {
  constructor(session: Session) {
    this.session = session
    this.recentProjects = new RecentProjects(session)
  }
  recentProjects: RecentProjects
  project?: ProjectShape
  session: Session
  onProjectLoaded(): void {
    this.session.windows.open(projectEditorConfig)
    this.session.windows.close('splash')
  }
  async getActive(): Promise<ProjectShape> {
    return this.project as ProjectShape
  }
  async getRecent(): Promise<string[]> {
    return this.recentProjects.get()
  }
  async new(): Promise<ProjectShape> {
    this.project = {
      id: '',
      version: '3.0',
      name: 'New Suite',
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
    return this.project
  }
  async load(filepath: string): Promise<ProjectShape> {
    return this.load_v3(filepath)
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
