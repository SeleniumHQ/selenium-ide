export type Type = 'Handler'
export type MenuNames =
  | 'application'
  | 'editBasics'
  | 'projectEditor'
  | 'testEditor'
  | 'projectView'
  | 'textField'
/**
 * Opens one of our available menu types. Types are governed
 * by Selenium IDE internals (sorry, no custom menus -_-)
 */
export type Shape = (name: MenuNames, ...args: any[]) => Promise<void>
