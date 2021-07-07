import { Session } from '../types'

export interface Background {
  master: { [key: string]: string }
  openedWindowIds: number[]
  [key: string]: number[] | { [key: string]: string }
}
const background = (_session: Session): Background => ({
  master: {},
  openedWindowIds: [],
})

export default background
