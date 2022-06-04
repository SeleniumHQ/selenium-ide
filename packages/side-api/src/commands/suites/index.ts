import { Shape as addTests } from './addTests'
import { Shape as create } from './create'
import { Shape as deleteSuite } from './delete'
import { Shape as removeTests } from './removeTests'
import { Shape as reorderTests } from './reorderTests'
import { Shape as update } from './update'

export * as addTests from './addTests'
export * as create from './create'
export * as delete from './delete'
export * as removeTests from './removeTests'
export * as reorderTests from './reorderTests'
export * as update from './update'

/**
 * Provides a body of functions around editing test suites.
 */
export type Shape = {
  addTests: addTests
  create: create
  delete: deleteSuite
  removeTests: removeTests
  reorderTests: reorderTests
  update: update
}
