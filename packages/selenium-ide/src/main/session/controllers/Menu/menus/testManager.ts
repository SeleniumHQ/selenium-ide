import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const testManagerCommands: MenuComponent<[string[]]> =
  (session) => async (testIDs) => {
    const outputFormats = await session.outputFormats.getFormats()
    return [
      {
        accelerator: 'CommandOrControl+Shift+Delete',
        click: async () => {
          await Promise.all(
            testIDs.map((testID) => session.api.tests.delete(testID))
          )
        },
        label: 'Delete Suite(s)',
      },
      { type: 'separator' },
      ...outputFormats.map((formatName) => ({
        label: `Export test(s) to ${formatName}`,
        click: async () => {
          await Promise.all(
            testIDs.map((testID) =>
              session.outputFormats.exportTestToFormat(formatName, testID)
            )
          )
        },
      })),
    ]
  }

const testManagerMenu = (session: Session) => async (testIDs: string[]) => {
  const menuItems = await testManagerCommands(session)(testIDs)
  return Menu.buildFromTemplate(menuItems)
}

export default testManagerMenu
