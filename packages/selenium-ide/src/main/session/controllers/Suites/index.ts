import { Session } from 'main/types'
import { ProjectShape, SuiteShape } from 'api/types'
import { randomUUID } from 'crypto'

export default class SuitesController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async addTest(suiteID: string, testID: string): Promise<SuiteShape> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    if (suite.tests.indexOf(testID) !== -1) {
      suite.tests.push(testID)
    }
    return suite
  }
  async removeTest(suiteID: string, testID: string): Promise<SuiteShape> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    const index = suite.tests.indexOf(testID)
    if (index !== -1) {
      suite.tests.splice(index, 1)
    }
    return suite
  }
  async reorderTest(
    suiteID: string,
    testID: string,
    newIndex: number
  ): Promise<SuiteShape> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    const prevIndex = suite.tests.indexOf(testID)
    suite.tests.splice(prevIndex, 1)
    suite.tests.splice(newIndex, 0, testID)
    return suite
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
  async delete(suiteID: string): Promise<boolean> {
    const project = this.session.projects.project as ProjectShape
    const index = project.suites.findIndex((suite) => suite.id === suiteID)
    if (index !== -1) {
      project.suites.splice(index, 1)
    }
    return true
  }
  async rename(suiteID: string, name: string): Promise<SuiteShape> {
    const project = this.session.projects.project as ProjectShape
    const suite = project.suites.find(
      (suite) => suite.id === suiteID
    ) as SuiteShape
    suite.name = name
    return suite
  }
}
