// import { ipcRenderer } from 'electron'
import Recorder from './recorder'
import {singleton as locatorBuilders} from 'browser/windows/PlaybackWindow/preload/locator-builders'

let recorder: Recorder
let eleTarget: HTMLElement | null

const shortcutHandler = new Map

shortcutHandler.set('verifyText', function () {
  return (eleTarget as any).innerText
})
shortcutHandler.set('verifyChecked', function () {
  return ''
})
shortcutHandler.set('verifyElementPresent', function () {
  return ''
})
shortcutHandler.set('waitForElementVisible', function () {
  return '1000'
})

async function onContextMenu (event: any) {
  eleTarget = event.target as HTMLElement
  /*
  const result = await ipcRenderer.invoke('show-shortcut-menu')
  if (!result) {
    eleTarget = null
    return
  }
  recorder.record(
    event,
    result.cmd,
    locatorBuilders.buildAll(eleTarget),
    shortcutHandler.get(result.cmd)(result.params)
  )
  */
  recorder.record(
    event,
    'click',
    locatorBuilders.buildAll(eleTarget),
    shortcutHandler.get('click')([])
  )
}

export function attach (_recorder: Recorder) {
  recorder = _recorder
  window.addEventListener('contextmenu', onContextMenu)
}

export function detach () {
  window.removeEventListener('contextmenu', onContextMenu)
}