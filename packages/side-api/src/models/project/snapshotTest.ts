import { SnapshotTestShape } from '@seleniumhq/side-model'
import { loadingID } from '../../constants/loadingID'

export const snapshotTest: SnapshotTestShape = {
  id: loadingID,
  snapshot: {
    commands: {},
    setupHooks: [],
    teardownHooks: [],
  },
}
