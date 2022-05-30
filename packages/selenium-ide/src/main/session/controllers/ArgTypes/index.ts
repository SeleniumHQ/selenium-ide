import ArgTypes from '@seleniumhq/side-model/dist/ArgTypes'
import BaseController from '../Base'

/**
 * This API is meant to be responsible for maintaining the state
 * of the argument types list in the main process
 */
export default class ArgTypesController extends BaseController {
  async get() {
    return ArgTypes
  }
}
