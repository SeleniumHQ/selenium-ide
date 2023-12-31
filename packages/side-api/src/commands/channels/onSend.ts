import { BaseListener } from '../../types/base'

/**
 * Contains a channel UUID and variadic arguments
 */
export type Shape = BaseListener<[string, ...any[]]>
