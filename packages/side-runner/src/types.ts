import { ProjectShape } from '@seleniumhq/side-model'
import { Command } from 'commander'

export type JSON =
  | null
  | string
  | number
  | boolean
  | JSON[]
  | { [key: string]: JSON }

export interface Project extends ProjectShape {
  path: string
}

export type ProxyType =
  | 'autodetect'
  | 'direct'
  | 'manual'
  | 'pac'
  | 'socks'
  | 'system'

export type ProxyInputOptions =
  | string
  | Record<string, string | string[] | number>

export type ProxyCapabilities = {
  proxyType: 'autodetect' | 'direct' | 'manual' | 'pac' | 'system'
  proxyAutoconfigUrl?: string
  ftpProxy?: string
  httpProxy?: string
  noProxy?: string[]
  sslProxy?: string
  socksProxy?: string
  socksVersion?: number
}

export interface SideRunnerCLIConfig {
  // Override the base URL that was set in the IDE
  baseUrl: string
  // Webdriver capabilities
  capabilities: string
  // Use specified YAML file for configuration. (default: .side.yml)
  configFile: string
  // Print debug logs
  debug: boolean
  // Print debug startup logs
  debugStartup: boolean
  // Run suites matching name
  filter: string
  // Forcibly run the project, regardless of project's version
  force: boolean
  // Options to configure Jest
  jestOptions: string
  // Maximum amount of workers that will run your tests, defaults to number of cores
  maxWorkers: number
  // Proxy options to pass, for use with manual, pac and socks proxies
  proxyOptions?: string
  // Type of proxy to use (one of: direct, manual, pac, socks, system)
  proxyType?: ProxyType
  // Retries for failed tests
  retries: number
  // Webdriver remote server
  server: string
  // The maximimum amount of time, in milliseconds, to spend attempting to locate
  // an element. (default: ${DEFAULT_TIMEOUT})
  timeout: number
}

export type SideRunnerAPI = Command & SideRunnerCLIConfig

export type Configuration = Required<
  Pick<
    SideRunnerCLIConfig,
    'baseUrl' | 'filter' | 'maxWorkers' | 'server' | 'timeout'
  >
> &
  Pick<
    SideRunnerCLIConfig,
    'debugStartup' | 'debug' | 'force' | 'proxyType' | 'retries'
  > & {
    capabilities: Record<string, JSON>
    debugConnectionMode: boolean
    projects: string[]
    proxyOptions: ProxyInputOptions
    runId: string
    path: string
    screenshotFailureDirectory?: string
    jestTimeout: number
  }
