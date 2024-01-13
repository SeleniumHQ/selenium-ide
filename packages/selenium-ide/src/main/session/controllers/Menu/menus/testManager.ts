import { MenuComponent } from 'main/types'
import { menuFactoryFromCommandFactory } from '../utils'

export const commands: MenuComponent<[string[]]> = (session) => (testIDs) => {
  const outputFormats = session.outputFormats.getFormats()
  return [
    {
      accelerator: 'CommandOrControl+Shift+Delete',
      click: async () => {
        await Promise.all(
          testIDs.map((testID) => session.api.tests.delete(testID))
        )
      },
      label: 'Delete test(s)',
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

export default menuFactoryFromCommandFactory(commands)
