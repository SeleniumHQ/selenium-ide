import { SnapshotShape, SuiteShape, TestShape } from 'api/types'
import loadingID from 'api/constants/loadingID'
import test from './test'
import snapshot from './snapshot'

/**
 * This is the actual shape of a side file,
 * as well as a key part of our main state tree.
 */

export interface ProjectShape {
  id: string
  version: '2.0' | '3.0'
  name: string
  url: string
  urls: string[]
  plugins: string[]
  tests: TestShape[]
  suites: SuiteShape[]
  snapshot: SnapshotShape
}

export type Shape = ProjectShape
const project: ProjectShape = {
  id: loadingID,
  name: 'loading',
  url: 'http://loading',
  version: '3.0',
  urls: [],
  plugins: [],
  suites: [],
  tests: [test],
  snapshot: snapshot,
}

export default project
