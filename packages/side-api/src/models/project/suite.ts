import { SuiteShape } from '@seleniumhq/side-model'
import { loadingID } from '../../constants/loadingID'

export const suite: SuiteShape = {
  id: loadingID,
  name: '',
  persistSession: false,
  parallel: false,
  timeout: 30000,
  tests: [],
}
