import { readFile } from 'fs/promises'
import { join } from 'path'
import type { WebDriver } from 'selenium-webdriver'
import getScriptManager from 'selenium-webdriver/bidi/scriptManager'
import { default as LogInspector } from 'selenium-webdriver/bidi/logInspector'
import { Session } from 'main/types'

let playbackWindowBidiPreload: string

export const createBidiAPIBindings = async (
  session: Session,
  driver: WebDriver
) => {
  if (!playbackWindowBidiPreload) {
    playbackWindowBidiPreload = await readFile(
      join(__dirname, `playback-window-bidi-preload-bundle.js`),
      'utf-8'
    )
  }
  const logInspector = await LogInspector(driver)
  await logInspector.init()
  logInspector.onConsoleEntry((entry) => {
    console.log('Playback console entry', entry)
  })
  logInspector.onJavascriptLog((entry) => {
    console.log('Playback javascript log', entry)
  })
  logInspector.onJavascriptException((entry) => {
    console.log('Playback javascript exception', entry)
  })

  const handle = await driver.getWindowHandle() as any
  const scriptManager = await getScriptManager(handle, driver as any)
  await scriptManager.addPreloadScript(
    playbackWindowBidiPreload as any,
    [],
    false
  )
  const pluginPreloads = await session.plugins.getPreloads()
  pluginPreloads.forEach(async (preload) => {
    await scriptManager.addPreloadScript(
      (await readFile(preload, 'utf-8')) as any,
      [],
      null
    )
  })
}
