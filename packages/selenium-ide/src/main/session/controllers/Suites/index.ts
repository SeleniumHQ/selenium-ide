import { ProjectShape, SuiteShape } from '@seleniumhq/side-model'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'

export default class SuitesController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async addTest(suiteID: string, testID: string): Promise<void> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    if (suite.tests.indexOf(testID) !== -1) {
      suite.tests.push(testID)
    }
  }
  async removeTest(suiteID: string, testID: string): Promise<void> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    const index = suite.tests.indexOf(testID)
    if (index !== -1) {
      suite.tests.splice(index, 1)
    }
  }
  async reorderTest(
    suiteID: string,
    testID: string,
    newIndex: number
  ): Promise<void> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    const prevIndex = suite.tests.indexOf(testID)
    suite.tests.splice(prevIndex, 1)
    suite.tests.splice(newIndex, 0, testID)
  }
  async create(): Promise<SuiteShape> {
    const project = this.session.projects.project as ProjectShape
    const suite = {
      id: randomUUID(),
      name: 'New Suite',
      persistSession: false,
      parallel: false,
      tests: [],
      timeout: 30000,
    }
    project.suites.push(suite)
    return suite
  }
  async delete(_suiteID: string): Promise<boolean> {
    return true
  }
  async update(
    _suiteID: string,
    _updates: Partial<Omit<SuiteShape, 'tests'>>
  ): Promise<boolean> {
    return true
  }
}
