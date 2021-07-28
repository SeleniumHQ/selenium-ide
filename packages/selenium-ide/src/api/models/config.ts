/**
 * Config data is data that is persisted across sessions
 * This will be things like whether to log chromedriver
 * Or what extensions are active
 */

export interface ConfigShape {
  extensions: string[]
}

export type Shape = ConfigShape
const config: ConfigShape = {
  extensions: [],
}

export default config
