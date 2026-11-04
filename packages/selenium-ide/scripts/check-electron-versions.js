// Fails when the installed electron and electron-chromedriver versions differ.
// The IDE drives its own window with electron-chromedriver, so both must be
// the same release. Dependency updates that bump only one of them wait here
// until the other one is published.
const electron = require('electron/package.json').version
const chromedriver = require('electron-chromedriver/package.json').version

if (electron !== chromedriver) {
  throw new Error(
    `electron ${electron} and electron-chromedriver ${chromedriver} must be the same version`
  )
}
console.log(`electron and electron-chromedriver are both ${electron}`)
