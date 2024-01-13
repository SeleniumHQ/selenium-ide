import { menuFactoryFromCommandFactory } from '../utils'
import { MenuComponent } from 'main/types'

export const commands: MenuComponent = () => () =>
  [
    {
      accelerator: 'CommandOrControl+X',
      label: 'Cut',
      role: 'cut',
    },
    {
      accelerator: 'CommandOrControl+C',
      label: 'Copy',
      role: 'copy',
    },
    {
      accelerator: 'CommandOrControl+V',
      label: 'Paste',
      role: 'paste',
    },
    {
      type: 'separator',
    },
    {
      accelerator: 'CommandOrControl+Z',
      label: 'Undo',
      role: 'undo',
    },
    {
      accelerator: 'Shift+CommandOrControl+Z',
      label: 'Redo',
      role: 'redo',
    },
  ]

export default menuFactoryFromCommandFactory(commands)
