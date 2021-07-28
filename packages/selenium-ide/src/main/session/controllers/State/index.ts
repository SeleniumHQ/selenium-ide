import clone from 'lodash/fp/clone'
import defaultState from 'api/models/state'
import { StateShape } from 'api/types'

export default class StateController {
  constructor() {
    this.state = clone(defaultState)
  }
  state: StateShape
}
