import { Session } from '../../../types/server'

export default (session: Session) => async (url: string) => {
  const driver = await session.driver.build()
  await driver.get(url)
}
