import { SuiteShape } from '@seleniumhq/side-model'
import loadingID from 'api/constants/loadingID'

export type Shape = SuiteShape
const suite: SuiteShape = {
  id: loadingID,
  name: '',
  persistSession: false,
  parallel: false,
  timeout: 30000,
  tests: [],
}

export default suite
