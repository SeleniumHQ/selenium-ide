import { CommandShape, TestShape } from '@seleniumhq/side-model'
import { randomUUID } from 'crypto'
import BaseController from '../Base'

export default class TestsController extends BaseController {
  static commandFromData(step: Partial<CommandShape> = {}): CommandShape {
    return {
      ...step,
      command: step.command || 'click',
      target: step.target || '',
      value: step.value || '',
      id: randomUUID(),
    }
  }

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

  async addSteps(
    _testID: string,
    _index: number,
    stepFields: Partial<CommandShape>[] = []
  ): Promise<CommandShape[]> {
    if (stepFields.length < 1) {
      return [TestsController.commandFromData()]
    }
    return stepFields.map(TestsController.commandFromData)
  }

  async create(): Promise<TestShape> {
    return {
      id: randomUUID(),
      name: 'New Test',
      commands: [
        {
          id: randomUUID(),
          command: 'open',
          target: '/',
          value: '',
        },
      ],
    }
  }
}
