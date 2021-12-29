import { CommandShape } from 'api/types'
import loadingID from 'api/constants/loadingID'
import command from './command'

export interface TestShape {
  id: string
  name: string
  commands: CommandShape[]
}
export type Shape = TestShape
const test: TestShape = {
  id: loadingID,
  name: '',
  commands: [command],
}

export default test
