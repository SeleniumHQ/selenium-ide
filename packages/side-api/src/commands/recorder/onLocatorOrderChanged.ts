import { BaseListener, EventMutator } from '../../types/base'

export type OnLocatorOrderChanged = [string[]]

/**
 * Runs whenever the order of locators is changed
 */
export type Shape = BaseListener<OnLocatorOrderChanged>

export const mutator: EventMutator<OnLocatorOrderChanged> = (
  session,
  [locators]
) => ({
  ...session,
  state: {
    ...session.state,
    locators,
  },
})
