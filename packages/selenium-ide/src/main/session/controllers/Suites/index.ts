import { SuiteShape, TestShape } from '@seleniumhq/side-model'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'

export default class SuitesController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async addTest(_suiteID: string, _testID: string): Promise<TestShape> {
    return {
      id: randomUUID(),
      name: 'New Test',
      commands: [],
    }
  }
  async removeTest(_suiteID: string, _testID: string): Promise<void> {}
  async reorderTest(
    _suiteID: string,
    _testID: string,
    _newIndex: number
  ): Promise<void> {}
  async create(): Promise<SuiteShape> {
    return {
      id: randomUUID(),
      name: 'New Suite',
      persistSession: false,
      parallel: false,
      tests: [],
      timeout: 30000,
    }
  }
  async delete(_suiteID: string): Promise<boolean> {
    return true
  }
}
