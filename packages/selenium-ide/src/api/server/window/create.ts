import { Session } from '../../../types/server'

export default (session: Session) => async (url: string) => {
  console.log('Making webdriver page', url)
  const driver = await session.driver.build({})
  await driver.get(url)
}
