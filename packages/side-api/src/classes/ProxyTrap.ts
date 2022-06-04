import set from 'lodash/fp/set'
import { ApiHandler } from '../types'

type NotVagueShape = null | boolean | string | number
type MaybeVagueShape = VagueShape | NotVagueShape
type VagueArrayShape = {
  [key: number]: MaybeVagueShape
}
type VagueMapShape = {
  [key: string]: MaybeVagueShape
}
type VagueShape = VagueMapShape | VagueArrayShape
function isVagueShape(obj: VagueShape | NotVagueShape): obj is VagueShape {
  return typeof obj === 'object' && obj !== null
}
/**
 * This recursing bastard creates a nested proxy to trap edits to a shape
 * Mainly this is just used for the background page
 */
const ProxyTrap =
  <SHAPE extends VagueShape, CTX extends any>(
    updateShape: (shape: SHAPE, context: CTX) => void
  ) =>
  (_path: string, context: CTX) =>
  (shape: SHAPE): SHAPE => {
    const proxyLayer = <LAYER extends VagueShape>(
      layer: LAYER,
      onUpdate: ApiHandler
    ): LAYER => {
      const validator = {
        get(target: LAYER, key: string | number | symbol): MaybeVagueShape {
          // @ts-expect-error
          const val: MaybeVagueShape = target[key]
          if (isVagueShape(val)) {
            return proxyLayer(val, (value) => {
              onUpdate(set(key, value, target), context)
            })
          }
          return val
        },
        set(target: any, key: string, value: any) {
          onUpdate(set(key, value, target))
          return true
        },
      }
      return new Proxy<LAYER>(layer, validator)
    }
    return proxyLayer<SHAPE>(shape, (shape, context) =>
      updateShape(shape, context)
    )
  }

export default ProxyTrap
