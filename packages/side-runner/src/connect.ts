import { Variables, WebDriverExecutor } from '@seleniumhq/side-runtime'
import { Configuration } from './types'

export default async (configuration: Configuration) => {
  const driver = new WebDriverExecutor({
    capabilities: JSON.parse(JSON.stringify(configuration.capabilities)),
    server: configuration.server,
  })
  console.log('Beginning test session')
  await driver.init({
    baseUrl: configuration.baseUrl,
    debug: true,
    logger: console,
    variables: new Variables(),
  })
  console.log('Test session created')
  const session = await driver.driver.getSession()
  console.log('Session ID:', session.getId())
  await driver.cleanup()
}
