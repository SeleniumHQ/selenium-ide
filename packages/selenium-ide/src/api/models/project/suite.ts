import loadingID from 'api/constants/loadingID'

export interface SuiteShape {
  id: string
  name: string
  persistSession: boolean
  parallel: boolean
  timeout: number
  tests: string[]
}

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
