import * as os from 'os'
import * as path from 'path'

const standardChromePathByOS: Record<string, string> = {
  Darwin: path.join(
    '/',
    'Applications',
    'Google\\ Chrome.app',
    'Contents',
    'MacOS',
    'Google\\ Chrome'
  ),
  Linux: 'google-chrome', // Available as an alias
}
const currentOS = os.type()
const chromePath = standardChromePathByOS[currentOS]
if (!chromePath) {
  throw new Error(`Currently unsupported platform ${currentOS}`)
}
/**
 * This is all the locations each browser might be located, grouped by OS.
 * It's solves a map by OS, containing a map by browser.
 * By using the supplied browser and the derived OS, we can figure out where we need to write to.
 */
export default chromePath
