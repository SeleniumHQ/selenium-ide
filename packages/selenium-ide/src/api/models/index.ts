import { ProjectShape } from './project/project'
import { StateShape } from './state'

export interface AppState {
  project: ProjectShape
  state: StateShape
}

export { default as project } from './project'
export { default as state } from './state'
