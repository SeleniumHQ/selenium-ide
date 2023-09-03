import { CoreSessionData } from '../../types/base'

/**
 * Get current session data.
 */
export type Shape = () => Promise<CoreSessionData>
