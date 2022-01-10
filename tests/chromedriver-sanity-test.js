const cp = require('child_process')
const path = require('path')
const webdriver = require('selenium-webdriver')

cp.spawn(
  path.join(
    process.cwd(),
    'packages',
    'selenium-ide',
    'files',
    'chromedriver-v96.0.4664.110'
  ),
  {
    stdio: 'inherit',
  }
)

setTimeout(async () => {
  const driver = await new webdriver.Builder()
    .withCapabilities({
      'goog:chromeOptions': {
        w3c: true,
      },
    })
    .usingServer('http://localhost:9515')
    .forBrowser('chrome')
    .build()
  await driver.get('http://www.google.com')
  await driver.manage().window().setRect({ height: 900, width: 900 })
}, 5000)
