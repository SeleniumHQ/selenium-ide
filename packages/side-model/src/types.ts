/**
 * The shape of all the serialized bits in a SIDE file
 */

export interface CommandShape {
  id: string
  comment: string
  command: string
  target: string
  targets: [string, string][]
  targetFallback?: string[]
  value: string
  valueFallback?: string[]
  isBreakpoint?: boolean
  skip?: boolean
  opensWindow?: boolean,
  windowHandleName?: string,
  windowTimeout?: number,
}

export interface SnapshotTestShape {
  id: string
  snapshot: {
    commands: { [key: string]: '\n' }
    setupHooks: []
    teardownHooks: []
  }
}

export interface SnapshotShape {
  tests: SnapshotTestShape[]
  dependencies: { [key: string]: string }
  jest: {
    extraGlobals: string[]
  }
}

export interface SuiteShape {
  id: string
  name: string
  persistSession: boolean
  parallel: boolean
  timeout: number
  tests: string[]
}

export interface TestShape {
  id: string
  name: string
  commands: CommandShape[]
}

export interface ProjectShape {
  id: string
  version: '2.0' | '3.0'
  name: string
  url: string
  urls: string[]
  plugins: string[]
  tests: TestShape[]
  suites: SuiteShape[]
  snapshot: SnapshotShape
}
