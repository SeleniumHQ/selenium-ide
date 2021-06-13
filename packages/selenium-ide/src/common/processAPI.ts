import set from 'lodash/set'
import { ApiShape } from '../types'

const resolvers = {
  client: require.context('../../src/api/client', true, /.ts$/),
  server: require.context('../../src/api/server', true, /.ts$/),
}
const prefix = './'
const prefixLength = prefix.length
const suffix = '.ts'
const suffixLength = suffix.length

type LoadArg = () => any
type HandlerArgs = { load: LoadArg; path: string }
type HandlerFunc = (args: HandlerArgs) => any
export default (apiGroup: string, handler: HandlerFunc): ApiShape => {
  const api: ApiShape = {}
  if (apiGroup !== 'client' && apiGroup !== 'server') {
    throw new Error(`Invalid api group supplied ${apiGroup}!`)
  }
  const resolver = resolvers[apiGroup]
  resolver.keys().forEach((loadPath: string) => {
    const apiPath = loadPath
      .slice(prefixLength, -suffixLength)
      .split('/')
      .join('.')
    const handlerArgs = {
      load: () => resolver(loadPath).default,
      path: apiPath,
    }
    set(api, apiPath, handler(handlerArgs))
  })
  return api
}
