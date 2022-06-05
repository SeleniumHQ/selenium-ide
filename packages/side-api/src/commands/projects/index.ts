import type { Shape as GetActive } from './getActive'
import type { Shape as GetRecent } from './getRecent'
import type { Shape as Load } from './load'
import type { Shape as NewProject } from './new'
import type { Shape as Save } from './save'
import type { Shape as Select } from './select'
import type { Shape as Update } from './update'

import * as getActive from './getActive'
import * as getRecent from './getRecent'
import * as load from './load'
import * as newProject from './new'
import * as save from './save'
import * as select from './select'
import * as update from './update'

export const commands = {
  getActive,
  getRecent,
  load,
  new: newProject,
  save,
  select,
  update,
}

export type Shape = {
  getActive: GetActive
  getRecent: GetRecent
  load: Load
  new: NewProject
  save: Save
  select: Select
  update: Update
}
