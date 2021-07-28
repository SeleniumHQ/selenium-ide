import loadingID from 'api/constants/loadingID'

export interface SnapshotTestShape {
  id: string
  snapshot: {
    commands: { [key: string]: '\n' }
    setupHooks: []
    teardownHooks: []
  }
}

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
