import add from './add'
import remove from './remove'
import select from './select'
import { Config } from '../../types'

export default (config: Config) => ({
  add: add(config),
  remove: remove(config),
  select: select(config),
})
