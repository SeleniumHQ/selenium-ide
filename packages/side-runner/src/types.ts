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

export type ProxyType = 'direct' | 'manual' | 'pac' | 'socks' | 'system'

export interface SideRunnerCLIConfig {
  // Webdriver capabilities
  capabilities: string
  // General parameters
  params: string
  // Webdriver remote server
  server: string
  // Run suites matching name
  filter: string
  // Maximum amount of workers that will run your tests, defaults to number of cores
  maxWorkers: number
  // The maximimum amount of time, in milliseconds, to spend attempting to locate
  // an element. (default: ${DEFAULT_TIMEOUT})
  timeout?: string | number
  // Override the base URL that was set in the IDE
  baseUrl: string
  // Type of proxy to use (one of: direct, manual, pac, socks, system)
  proxyType?: ProxyType
  // Proxy options to pass, for use with manual, pac and socks proxies
  proxyOptions?: string
  // Use specified YAML file for configuration. (default: .side.yml)
  configFile: string
  // Write test results to files, format is defined by --output-format
  outputDirectory: string
  // Format for the output. (default: jest)
  outputFormat: 'jest' | 'junit'
  // Forcibly run the project, regardless of project's version
  force: boolean
  // Print debug logs
  debug: boolean
  // Only extract the project file to code (this feature is for debugging purposes)
  extract: boolean
  // Run the extracted project files (this feature is for debugging purposes)
  run: string
}

export type SideRunnerAPI = Command & SideRunnerCLIConfig

export type Configuration = Pick<
  SideRunnerCLIConfig,
  'baseUrl' | 'proxyType' | 'timeout'
> & {
  capabilities: Record<string, JSON>
  params: Record<string, JSON>
  proxyOptions: Record<string, JSON>
  runId: string
  path: string
  server: string
}
