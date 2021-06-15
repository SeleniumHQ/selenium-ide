import { ApiHandler } from '../types'

type HandlerFunc = (path: string, handler: ApiHandler) => any

export default <Api, Return>(api: Api, handler: HandlerFunc): Return => {
  return recurse(api, '')

  function recurse(obj: any, path: string) {
    const rv: any = {}
    for (const key in obj) {
      const entry = obj[key]
      if (typeof entry === 'function') {
        rv[key] = handler(`${path}${key}`, entry)
      } else {
        rv[key] = recurse(entry, `${path}${key}.`)
      }
    }
    return rv
  }
}
