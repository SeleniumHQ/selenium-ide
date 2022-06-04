import { ProjectShape } from '@seleniumhq/side-model'
import { StateShape } from './state'

export interface AppState {
  project: ProjectShape
  state: StateShape
}

export * from './project'
export * from './state'
