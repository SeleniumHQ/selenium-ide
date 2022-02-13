import { ProjectShape } from '@seleniumhq/side-model'
import { promises as fs } from 'fs'
import { Session } from 'main/types'
import defaultProject from 'api/models/project'
import RecentProjects from './Recent'

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
    this.session.commands.init()
    this.project = project
    this.session.windows.close('splash')
    await this.session.windows.open('project-playback-window')
    await this.session.windows.open('project-test-list')
    await this.session.windows.open('project-test-command-list')
    await this.session.windows.open('project-playback-controls')
    await this.session.windows.open('project-command-editor')

    const childWindows = [
      await this.session.windows.get('project-test-list'),
      await this.session.windows.get('project-test-command-list'),
      await this.session.windows.get('project-playback-controls'),
      await this.session.windows.get('project-command-editor'),
    ];
    const mainWindow = await this.session.windows.get('project-playback-window');
    mainWindow.on("focus", () => {
      childWindows.forEach((win) => {
        win.showInactive();
      })
    })
    mainWindow.on("blur", () => {
      childWindows.forEach((win) => {
        win.hide();
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
