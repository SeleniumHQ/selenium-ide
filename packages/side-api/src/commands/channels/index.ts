import type { Shape as OnSend } from './onSend'
import type { Shape as Send } from './send'

import * as onSend from './onSend'
import * as send from './send'

export const commands = {
  onSend,
  send,
}

/**
 * Manages the establishing of bidirectional communication channels
 */
export type Shape = {
  onSend: OnSend
  send: Send
}
