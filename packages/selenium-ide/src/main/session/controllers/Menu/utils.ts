import { MenuItemConstructorOptions } from 'electron'

export const multipleCommand = (
  accelerators: string[],
  options: Omit<MenuItemConstructorOptions, 'accelerator'>
): MenuItemConstructorOptions[] =>
  accelerators.map((accelerator, index) => ({
    ...options,
    accelerator,
    visible: index === 0,
  }))
