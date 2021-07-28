import loadingID from 'api/constants/loadingID'

/**
 * Command shape is the shape of command data in Selenium IDE
 * step files
 */

export interface CommandShape {
  id: string
  comment: string
  command: string
  target: string
  targets: [string, string][]
  value: string
}
export type Shape = CommandShape

export const command: CommandShape = {
  command: '',
  comment: '',
  id: loadingID,
  target: '',
  targets: [],
  value: '',
}

export default command
