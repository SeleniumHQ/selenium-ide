import { SnapshotTestShape } from '@seleniumhq/side-model'
import loadingID from '../../constants/loadingID'

export type Shape = SnapshotTestShape
const snapshotTest: SnapshotTestShape = {
  id: loadingID,
  snapshot: {
    commands: {},
    setupHooks: [],
    teardownHooks: [],
  },
}
export default snapshotTest