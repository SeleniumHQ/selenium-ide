import type { Shape as AddTests } from './addTests'
import type { Shape as Create } from './create'
import type { Shape as DeleteSuite } from './delete'
import type { Shape as RemoveTests } from './removeTests'
import type { Shape as ReorderTests } from './reorderTests'
import type { Shape as Update } from './update'

import * as addTests from './addTests'
import * as create from './create'
import * as deleteSuite from './delete'
import * as removeTests from './removeTests'
import * as reorderTests from './reorderTests'
import * as update from './update'

export const commands = {
  addTests,
  create,
  delete: deleteSuite,
  removeTests,
  reorderTests,
  update,
}

/**
 * Provides a body of functions around editing test suites.
 */
export type Shape = {
  addTests: AddTests
  create: Create
  delete: DeleteSuite
  removeTests: RemoveTests
  reorderTests: ReorderTests
  update: Update
}
