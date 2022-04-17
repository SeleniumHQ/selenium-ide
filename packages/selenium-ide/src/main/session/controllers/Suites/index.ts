import { SuiteShape, TestShape } from '@seleniumhq/side-model'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'

export default class SuitesController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session

  async addTest(): Promise<TestShape> {
    return {
      id: randomUUID(),
      name: 'New Test',
      commands: [],
    }
  }

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
}
