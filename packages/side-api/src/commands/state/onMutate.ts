import { BaseListener } from '../../types/base'

export type OnMutate = [path: string, data: any]

/**
 * Called whenever session state is manipulated by an api endpoint
 * or otherwise.
 */
export type Shape = BaseListener<OnMutate>
