import { SnapshotTestShape } from './snapshotTest'

export interface SnapshotShape {
  tests: SnapshotTestShape[]
  dependencies: { [key: string]: string }
  jest: {
    extraGlobals: string[]
  }
}

export type Shape = SnapshotShape
export default {
  tests: [],
  dependencies: {},
  jest: {
    extraGlobals: [],
  },
}
