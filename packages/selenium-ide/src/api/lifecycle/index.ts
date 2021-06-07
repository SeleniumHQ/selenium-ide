import init from './init'
import { Config } from '../../types'

export default (config: Config) => ({
  init: init(config),
})
