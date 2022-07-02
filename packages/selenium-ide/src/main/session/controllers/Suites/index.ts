import { SuiteShape } from '@seleniumhq/side-model'
import { randomUUID } from 'crypto'
import BaseController from '../Base'

export default class SuitesController extends BaseController {
  async create(name?: string): Promise<SuiteShape> {
    return {
      id: randomUUID(),
      name: name === undefined ? 'New Suite' : name,
      persistSession: false,
      parallel: false,
      tests: [],
      timeout: 30000,
    }
  }
}
