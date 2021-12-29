import * as child_process from 'child_process'
import * as os from 'os'
import defaultBrowserPath from './default-browser-path'

const chromeVersionCommandByOS: Record<string, string> = {
  Darwin: '--version',
  Linux: '--product-version',
}

const currentOS = os.type()
const chromeVersionCommand = chromeVersionCommandByOS[currentOS]
if (!chromeVersionCommand) {
  throw new Error(`Currently unsupported platform ${currentOS}`)
}
/**
 * This is all the locations each browser might be located, grouped by OS.
 * It's solves a map by OS, containing a map by browser.
 * By using the supplied browser and the derived OS, we can figure out where we need to write to.
 */
export default (pathToBrowser = defaultBrowserPath): Error | string => {
  const command = `${pathToBrowser} ${chromeVersionCommand}`
  const result = `${child_process.execSync(command)}`
  const resultSegments = result.trim().split(' ')
  if (resultSegments.length !== 3) {
    return new Error(result)
  }
  return resultSegments.pop() as string
}
