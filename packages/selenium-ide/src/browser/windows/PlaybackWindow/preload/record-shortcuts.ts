import Recorder from './recorder'
import { singleton as locatorBuilders } from './locator-builders'

let recorder: Recorder
async function onContextMenu(event: any) {
  const el = event.target as HTMLElement
  const targets = locatorBuilders.buildAll(el);
  const selectedCommand = await window.sideAPI.menus.openSync('playback')
  switch (selectedCommand) {
    case 'Record Wait For Element Present':
      recorder.record(
        event,
        'waitForElementPresent',
        targets,
        '',
        false,
        null,
        true
      )
      break
    case 'Record Wait For Element Visible':
      recorder.record(
        event,
        'waitForElementVisible',
        targets,
        '',
        false,
        null,
        true
      )
      break
    case 'Record Wait For Element Text':
      recorder.record(
        event,
        'waitForText',
        targets,
        el.innerText,
        false,
        null,
        true
      )
      break
    case 'Record Wait For Element Editable':
      recorder.record(
        event,
        'waitForElementEditable',
        targets,
        '',
        false,
        null,
        true
      )
      break
  }
}

export function attach(_recorder: Recorder) {
  recorder = _recorder
  window.addEventListener('contextmenu', onContextMenu)
}

export function detach() {
  window.removeEventListener('contextmenu', onContextMenu)
}
