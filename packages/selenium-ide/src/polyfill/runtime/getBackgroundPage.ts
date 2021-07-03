import browserHandler from 'browser/helpers/Handler'
import mainHandler from 'main/helpers/Handler'
import { LoadedWindow } from 'browser/types'
import { Session } from 'main/types'
import browserProxyTrap from '../__helpers/ProxyTrap'

export type Shape = () => Promise<Session['background']>

export const main = mainHandler((_path, session) => () => session.background)

export const browser = browserHandler<Shape>({
  transform: browserProxyTrap<Session['background'], LoadedWindow>(
    async (background, window) => {
      await window.sideAPI.runtime.setBackgroundPage(background)
    }
  ),
})
