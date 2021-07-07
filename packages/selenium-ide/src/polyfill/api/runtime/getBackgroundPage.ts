import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'
import { LoadedWindow } from 'browser/types'
import { Session } from 'main/types'
import browserProxyTrap from 'polyfill/classes/ProxyTrap'

export type Shape = () => Promise<Session['background']>

export const browser = browserHandler<Shape>({
  transform: browserProxyTrap<Session['background'], LoadedWindow>(
    async (background, window) => {
      await window.sideAPI.runtime.setBackgroundPage(background)
    }
  ),
})

export const main = mainHandler((_path, session) => () => session.background)
