import set from 'lodash/set'
import { ApiShape } from '../types'

const resolvers = {
  client: require.context('../../src/api/client', true, /.ts$/),
  events: require.context('../../src/api/events', true, /.ts$/),
  server: require.context('../../src/api/server', true, /.ts$/),
}
const prefix = './'
const prefixLength = prefix.length
const suffix = '.ts'
const suffixLength = suffix.length

type LoadArg = () => any
type HandlerArgs = { load: LoadArg; path: string }
type HandlerFunc = (args: HandlerArgs) => any

export default (
  apiGroup: 'client' | 'events' | 'server',
  handler: HandlerFunc
): ApiShape => {
  const api: ApiShape = {}
  const resolver = resolvers[apiGroup]
  resolver.keys().forEach((path: string) => {
    const apiPath = path
      .slice(prefixLength, -suffixLength)
      .split('/')
      .join('.')
    const handlerArgs = {
      load: () => resolver(path).default,
      path: apiPath,
    }
    set(api, apiPath, handler(handlerArgs))
  })
  return api
}
