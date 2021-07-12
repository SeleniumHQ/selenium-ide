import merge from 'lodash/fp/merge'
import { Session } from 'main/types'
import { CommandShape, ProjectShape, TestShape } from 'api/types'
import { randomUUID } from 'crypto'

export default class TestsController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async addStep(
    testID: string,
    index: number,
    step: CommandShape
  ): Promise<TestShape> {
    const project = this.session.projects.project as ProjectShape
    const test = project.tests.find((test) => test.id === testID) as TestShape
    test.commands.splice(index, 0, step)
    return test
  }
  async removeStep(testID: string, stepID: string): Promise<TestShape> {
    const project = this.session.projects.project as ProjectShape
    const test = project.tests.find((test) => test.id === testID) as TestShape
    const index = test.commands.findIndex((step) => step.id === stepID)
    test.commands.splice(index, 1)
    return test
  }
  async updateStep(
    testID: string,
    stepID: string,
    step: Partial<CommandShape>
  ): Promise<TestShape> {
    const project = this.session.projects.project as ProjectShape
    const test = project.tests.find((test) => test.id === testID) as TestShape
    const index = test.commands.findIndex((step) => step.id === stepID)
    test.commands[index] = merge(test.commands[index], step)
    test.commands.splice(index, 1)
    return test
  }
  async reorderStep(
    testID: string,
    stepID: string,
    newIndex: number
  ): Promise<TestShape> {
    const project = this.session.projects.project as ProjectShape
    const test = project.tests.find((test) => test.id === testID) as TestShape
    const index = test.commands.findIndex((step) => step.id === stepID)
    const [step] = test.commands.splice(index, 1)
    test.commands.splice(newIndex, 0, step)
    return test
  }
  async create(): Promise<TestShape> {
    return {
      id: randomUUID(),
      name: 'New Test',
      commands: [],
    }
  }
  async delete(testID: string): Promise<ProjectShape> {
    const project = this.session.projects.project as ProjectShape
    const testIndex = project.tests.findIndex((test) => test.id === testID)
    project.tests.splice(testIndex, 1)
    project.suites.forEach((suite) => {
      const index = suite.tests.indexOf(testID)
      if (index !== -1) {
        suite.tests.splice(index, 1)
      }
    })
    return project
  }
  async rename(testID: string, name: string): Promise<TestShape> {
    const project = this.session.projects.project as ProjectShape
    const test = project.tests.find((test) => test.id === testID) as TestShape
    test.name = name
    return test
  }
}
