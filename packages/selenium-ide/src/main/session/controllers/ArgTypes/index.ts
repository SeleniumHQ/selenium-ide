import ArgTypes from '@seleniumhq/side-model/dist/ArgTypes'
import BaseController from '../Base'

export default class ArgTypesController extends BaseController {
  async get() {
    return ArgTypes
  }
}
