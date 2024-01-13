import { Menu } from 'electron'
import { Session } from 'main/types'
import menus, { commands as menuCommands } from './menus'
import BaseController from '../Base'

/**
 * This just contains a list of menus in the folder
 * and makes it easy to open a menu by specifying a name.
 */
export default class MenuController extends BaseController {
  constructor(session: Session) {
    super(session)
    this.openApplication = this.openApplication.bind(this)
  }

  async onProjectLoaded() {
    this.openApplication()
    this.session.api.state.onMutate.addListener(this.openApplication)
  }

  async onProjectUnloaded() {
    Menu.setApplicationMenu(null)
    this.session.api.state.onMutate.removeListener(this.openApplication)
  }

  async open(menuName: keyof typeof menus, ...args: any[]) {
    const menu = await menus[menuName](this.session)(...args)
    menu.popup()
  }

  openSync(menuName: keyof typeof menus, ...args: any[]) {
    const replaceClickEventsWithLabelResolvers = (
      commands: Electron.MenuItemConstructorOptions[],
      resolve: (label: string) => void
    ): Electron.MenuItemConstructorOptions[] => {
      return commands.map((command) => {
        if (command.type === 'separator') {
          return { type: 'separator' }
        }
        if (Array.isArray(command.submenu)) {
          return {
            ...command,
            submenu: replaceClickEventsWithLabelResolvers(
              command.submenu,
              resolve
            ),
          }
        }
        const fallbackHandler = () => resolve(command.label!)
        const clickHandler: Electron.MenuItemConstructorOptions['click'] =
          command.click
            ? async (...args) => {
              await command.click!(...args)
              resolve(command.label!)
            }
            : fallbackHandler
        return {
          ...command,
          click: clickHandler,
        }
      })
    }
    return new Promise((resolve) => {
      // @ts-expect-error who knows
      const commands = menuCommands[menuName](this.session)(...args)
      const menu = Menu.buildFromTemplate(
        replaceClickEventsWithLabelResolvers(commands, resolve)
      )
      menu.on('menu-will-close', () => {
        setTimeout(() => resolve(null), 100)
      })
      menu.popup()
    })
  }

  async openApplication() {
    const menu = await menus.application(this.session)()
    Menu.setApplicationMenu(menu)
  }
}
