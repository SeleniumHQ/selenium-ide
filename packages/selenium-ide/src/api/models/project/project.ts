import { ProjectShape } from '@seleniumhq/side-model'
import loadingID from 'api/constants/loadingID'
import test from './test'
import snapshot from './snapshot'

/**
 * This is the actual shape of a side file,
 * as well as a key part of our main state tree.
 */

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
