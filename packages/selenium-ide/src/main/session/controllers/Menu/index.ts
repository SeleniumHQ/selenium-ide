import { Menu } from 'electron'
import { Session } from 'main/types'
import menus from './menus'
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
    // @ts-expect-error
    const menu = await menus[menuName](this.session)(...args)
    menu.popup()
  }
  async openApplication() {
    const menu = await menus.application(this.session)()
    Menu.setApplicationMenu(menu)
  }
}
