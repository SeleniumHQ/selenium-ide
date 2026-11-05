import { MenuComponent } from 'main/types'
import { menuFactoryFromCommandFactory } from '../utils'

export const commands: MenuComponent = (session) => () => [
  {
    accelerator: 'CommandOrControl+Shift+D',
    click: async () => {
      await session.system.dumpSession()
    },
    label: session.system.languageMap.helpMenuTree.dumpSession,
  },
]

export default menuFactoryFromCommandFactory(commands)
