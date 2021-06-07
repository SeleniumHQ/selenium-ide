import lifecycle from './lifecycle'
import extensions from './extensions'
import tabs from './tabs'
import { Config } from '../types'

export default (config: Config) => ({
  extensions: extensions(config),
  lifecycle: lifecycle(config),
  tabs: tabs(config),
})
