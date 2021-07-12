import Store from 'electron-store'

interface WindowPositionBound {
  x: number
  y: number
  width: number
  height: number
}

interface Schema {
  plugins: string[]
  recentProjects: string[]
  windowPositionBounds: {
    [key: string]: WindowPositionBound
  }
}

export default new Store<Schema>({
  defaults: {
    plugins: [],
    recentProjects: [],
    windowPositionBounds: {},
  },
})
