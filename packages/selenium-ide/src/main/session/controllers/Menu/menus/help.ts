import { MenuComponent } from 'main/types'
import { menuFactoryFromCommandFactory } from '../utils'

export const commands: MenuComponent = (session) => () =>
  [
    {
      accelerator: 'CommandOrControl+Shift+D',
      click: async () => {
        await session.system.dumpSession()
      },
      label: 'Dump Session To File',
    },
  ]


export default menuFactoryFromCommandFactory(commands)
