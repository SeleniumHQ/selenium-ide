import { CoreSessionData } from '../../types'

/**
 * Get current session data.
 */
export type Shape = () => Promise<CoreSessionData>
