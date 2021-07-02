import get from 'lodash/fp/get'
import set from 'lodash/fp/set'
import Handler from './Handler'
import { LoadedWindow } from '../types'
import { ApiHandler } from 'polyfill/types'

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
 * This recursing bastard creates a nested proxy to trap edits to backgroundPage
 * @param {*} shape
 * @param {*} processShape
 * @returns
 */
const proxyTrap = <SHAPE extends VagueShape>(
  shape: SHAPE,
  processShape: (shape: SHAPE) => void
) => {
  const proxyLayer = <LAYER extends VagueShape>(
    layer: LAYER,
    onUpdate: ApiHandler
  ): LAYER => {
    const validator = {
      get(target: LAYER, key: string | number | symbol): MaybeVagueShape {
        // @ts-ignore
        const val: MaybeVagueShape = target[key]
        if (isVagueShape(val)) {
          return proxyLayer(val, (value) => {
            onUpdate(set(key, value, target))
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
  return proxyLayer<SHAPE>(shape, (newShape) => processShape(newShape))
}

const ProxyObject =
  <SHAPE extends VagueMapShape>(update: string) =>
  (path: string, window: LoadedWindow) =>
  async () => {
    const [shape] = await Handler()(path, window)()
    return proxyTrap<SHAPE>(shape, async (newShape) => {
      // @ts-ignore
      await get<(shape: SHAPE) => void>(update, window.sideAPI)(newShape)
    })
  }

export default ProxyObject
