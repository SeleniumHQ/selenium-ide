import { TestShape } from '@seleniumhq/side-model'
import command from './command'
import loadingID from '../../constants/loadingID'

export type Shape = TestShape
const test: TestShape = {
  id: loadingID,
  name: '',
  commands: [command],
}

export default test
