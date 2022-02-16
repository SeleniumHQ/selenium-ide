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
    _stepFields: Partial<CommandShape>
  ): Promise<boolean> {
    return true
  }

  async removeStep(_testID: string, _stepID: string): Promise<boolean> {
    return true
  }

  async updateStep(
    _testID: string,
    _stepID: string,
    _step: Partial<CommandShape>
  ): Promise<boolean> {
    return true
  }

  async reorderStep(
    _testID: string,
    _stepID: string,
    _newIndex: number
  ): Promise<boolean> {
    return true
  }

  async create(): Promise<TestShape> {
    return {
      id: randomUUID(),
      name: 'New Test',
      commands: [],
    }
  }

  async delete(_testID: string): Promise<boolean> {
    return true
  }

  async rename(_testID: string, _name: string): Promise<boolean> {
    return true
  }
}
