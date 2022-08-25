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
  // Run suites matching name
  filter: string
  // Forcibly run the project, regardless of project's version
  force: boolean
  // Maximum amount of workers that will run your tests, defaults to number of cores
  maxWorkers: number
  // General parameters
  params: string
  // Proxy options to pass, for use with manual, pac and socks proxies
  proxyOptions?: string
  // Type of proxy to use (one of: direct, manual, pac, socks, system)
  proxyType?: ProxyType
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
  Pick<SideRunnerCLIConfig, 'debug' | 'force' | 'proxyType'> & {
    capabilities: Record<string, JSON>
    params: Record<string, JSON>
    projects: string[]
    proxyOptions: ProxyInputOptions
    runId: string
    path: string
  }
