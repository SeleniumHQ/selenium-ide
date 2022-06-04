import { ProjectShape } from '@seleniumhq/side-model'
import test from './test'
import snapshot from './snapshot'
import loadingID from '../../constants/loadingID'

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
