import { Shape as getActive } from './getActive'
import { Shape as getRecent } from './getRecent'
import { Shape as load } from './load'
import { Shape as newProject } from './new'
import { Shape as save } from './save'
import { Shape as select } from './select'
import { Shape as update } from './update'

export * as getActive from './getActive'
export * as getRecent from './getRecent'
export * as load from './load'
export * as new from './new'
export * as save from './save'
export * as select from './select'
export * as update from './update'

export type Shape = {
  getActive: getActive
  getRecent: getRecent
  load: load
  new: newProject
  save: save
  select: select
  update: update
}
