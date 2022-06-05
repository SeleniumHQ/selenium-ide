import { UserPrefs } from '../../models'

/**
 * Get user preferences
 */
export type Shape = () => Promise<UserPrefs>
