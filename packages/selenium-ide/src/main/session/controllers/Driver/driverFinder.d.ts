// selenium-webdriver exports this module, but @types/selenium-webdriver
// doesn't declare it
declare module 'selenium-webdriver/common/driverFinder' {
  import { Capabilities } from 'selenium-webdriver'

  export function getBinaryPaths(capabilities: Capabilities): {
    browserPath: string
    driverPath: string
  }
}
