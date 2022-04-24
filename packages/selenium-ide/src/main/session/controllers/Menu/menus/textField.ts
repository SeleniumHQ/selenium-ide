import { Menu } from 'electron'

const textFieldMenu = () => async () =>
  Menu.buildFromTemplate([
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
      type: 'separator'
    },
    {
      accelerator: 'CommandOrControl+Z',
      label: 'Undo',
      role: 'undo'
    },
    {
      accelerator: 'Shift+CommandOrControl+Z',
      label: 'Redo',
      role: 'redo'
    }
  ])

export default textFieldMenu
