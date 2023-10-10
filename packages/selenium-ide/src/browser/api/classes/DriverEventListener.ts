import { BaseListener, VariadicArgs } from '@seleniumhq/side-api'
import { sendMessage } from './DriverUtils'

type DriverEventShape<PARAMS> = {
  path: string
  args: PARAMS
}

const baseListener = <ARGS extends VariadicArgs>(
  path: string
): BaseListener<ARGS> => {
  const listeners: any[] = []
  return {
    addListener(listener) {
      console.debug(path, 'listener added')
      sendMessage(`${path}.addListener`)
      listeners.push(listener)
    },
    dispatchEvent(...args) {
      console.debug(path, 'dispatching event')
      listeners.forEach((fn) => fn(...args))
    },
    hasListener(listener) {
      return listeners.includes(listener)
    },
    listeners,
    removeListener(listener) {
      const index = listeners.indexOf(listener)
      if (index === -1) {
        throw new Error(`Unable to remove listener for ${path} ${listener}`)
      }
      sendMessage(`${path}.removeListener`)
      console.debug(path, 'listener removed')
      listeners.splice(index, 1)
    },
  }
}

const wrappedListener = <ARGS extends VariadicArgs>(path: string) => {
  const api = baseListener<ARGS>(path)
  window.addEventListener('message', (event) => {
    const data = event.data as DriverEventShape<ARGS>
    if (data.path === path) {
      api.dispatchEvent(...data.args)
    }
  })
  return api
}

const EventListener =
  <ARGS extends VariadicArgs>() =>
  (path: string) =>
    wrappedListener<ARGS>(path)

export default EventListener
