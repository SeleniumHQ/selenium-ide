import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const suiteManagerCommands: MenuComponent<[string[]]> =
  (session) => async (suiteIDs) => {
    const outputFormats = await session.outputFormats.getFormats()
    return [
      {
        accelerator: 'CommandOrControl+Shift+Delete',
        click: async () => {
          await Promise.all(
            suiteIDs.map((suiteID) => session.api.suites.delete(suiteID))
          )
        },
        label: 'Delete Suite(s)',
      },
      { type: 'separator' },
      ...outputFormats.map((formatName) => ({
        label: `Export suite(s) to ${formatName}`,
        click: async () => {
          await Promise.all(
            suiteIDs.map((suiteID) =>
              session.outputFormats.exportSuiteToFormat(formatName, suiteID)
            )
          )
        },
      })),
    ]
  }

const suiteManagerMenu = (session: Session) => async (suiteIDs: string[]) => {
  const menuItems = await suiteManagerCommands(session)(suiteIDs)
  return Menu.buildFromTemplate(menuItems)
}

export default suiteManagerMenu
