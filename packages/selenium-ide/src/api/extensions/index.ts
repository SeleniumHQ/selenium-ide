import load from './load'
import { Config } from '../../types'

export default (config: Config) => ({
  load: load(config),
})
