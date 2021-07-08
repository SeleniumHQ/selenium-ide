import { promises as fs } from 'fs'
import { Session } from 'main/types'

interface CommandShape {
  id: string
  comment: string
  command: string
  target: string
  targets: [string, string][]
  value: string
}

interface TestShape {
  id: string
  name: string
  commands: CommandShape[]
}

interface SuiteShape {
  id: string
  name: string
  persistSession: boolean
  parallel: boolean
  timeout: number
  tests: string[]
}

interface SnapshotTestShape {
  id: string
  snapshot: {
    commands: { [key: string]: '\n' }
    setupHooks: []
    teardownHooks: []
  }
}

interface SnapshotsShape {
  tests: SnapshotTestShape[]
  dependencies: { [key: string]: string }
  jest: {
    extraGlobals: string[]
  }
}

interface ProjectShape {
  id: string
  version: '2.0' | '3.0'
  name: string
  url: string
  urls: string[]
  plugins: any[]
  tests: TestShape[]
  suites: SuiteShape[]
  snapshot: SnapshotsShape
}

export default (session: Session) => {
  let project: ProjectShape
  const projectAPI = {
		getRecent: () => {

		},
    new: () => {
      project = {
        id: '',
        version: '3.0',
        name: 'New Suite',
        url: 'http://www.google.com',
        urls: ['http://www.google.com'],
        plugins: [],
        suites: [],
        tests: [],
        snapshot: {
          dependencies: {},
          tests: [],
          jest: {
            extraGlobals: [],
          },
        },
      }
			return project
    },
    load: async (filepath: string) => {
			const fileContents = await fs.readFile(filepath)
			session.app.addRecentDocument(filepath)
		},
    save: (filename: string) => {

		},
  }
}
