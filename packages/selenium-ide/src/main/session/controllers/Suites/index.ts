import { SuiteShape } from '@seleniumhq/side-model'
import { randomUUID } from 'crypto'
import BaseController from '../Base'

export default class SuitesController extends BaseController {
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
