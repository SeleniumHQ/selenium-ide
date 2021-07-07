import { MenuItem } from 'electron'
import browserHandler from 'browser/polyfill/classes/Handler'
import mainHandler from 'main/polyfill/classes/Handler'

export interface CreateContextMenuOptions {
  checked: boolean
  contexts: string[]
  documentUrlPatterns: string[]
  enabled: boolean
  id: string
  parentId: string | number
  targetUrlPatterns: string[]
  title: string
  type: 'normal' | 'checkbox' | 'radio' | 'separator'
  visible: boolean
}

export type Shape = (opts: CreateContextMenuOptions) => string

export const browser = browserHandler<Shape>()
export const main = mainHandler<Shape>(
  (_path, session) =>
    async ({ checked, id, title, type }) => {
      session.menu.append(
        new MenuItem({
          click: (menuItem: MenuItem) => {
            session.api.contextMenus.onClicked.dispatchEvent({
              checked: menuItem.checked,
              menuItemId: menuItem.id,
            })
          },
          checked,
          enabled: true,
          id,
          label: title,
          type,
        })
      )
      return id
    }
)
