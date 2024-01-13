import { Menu, MenuItemConstructorOptions } from 'electron'
import { Session } from 'main/types'

export const multipleCommand = (
  accelerators: string[],
  options: Omit<MenuItemConstructorOptions, 'accelerator'>
): MenuItemConstructorOptions[] =>
  accelerators.map((accelerator, index) => ({
    ...options,
    accelerator,
    visible: index === 0,
  }))

export const menuFactoryFromCommandFactory =
  (
    commands: (
      session: Session
    ) => (...args: any[]) => MenuItemConstructorOptions[]
  ) =>
  (session: Session) =>
  async (...args: any[]) =>
    Menu.buildFromTemplate(commands(session)(...args))
