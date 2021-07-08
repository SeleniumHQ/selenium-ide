import Store from 'electron-store'

interface Schema {
  plugins: string[]
  recentProjects: string[]
}

export default new Store<Schema>({
  defaults: {
    plugins: [],
    recentProjects: [],
  },
})
