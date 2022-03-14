import { CommandShape, TestShape } from '@seleniumhq/side-model'
import { Session } from 'main/types'
import { randomUUID } from 'crypto'

export default class TestsController {
  constructor(session: Session) {
    this.session = session
  }

  session: Session

  getByID(id: string): TestShape {
    return this.session.projects.project.tests.find(
      (t) => t.id === id
    ) as TestShape
  }

  getByName(name: string): TestShape {
    return this.session.projects.project.tests.find(
      (t) => t.name === name
    ) as TestShape
  }

  async addStep(
    _testID: string,
    _index: number,
    stepFields: Partial<CommandShape> = {}
  ): Promise<CommandShape> {
    return {
      id: randomUUID(),
      command: stepFields.command || 'click',
      target: stepFields.target || '',
      value: stepFields.value || '',
    }
  }

  async create(): Promise<TestShape> {
    return {
      id: randomUUID(),
      name: 'New Test',
      commands: [{
        id: randomUUID(),
        command: 'open',
        target: '/',
        value: ''
      }],
    }
  }
}
