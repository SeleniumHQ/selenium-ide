#!/usr/bin/env node

// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import util from 'util'
import { Command } from 'commander'
import glob from 'glob'
import { createLogger, format, transports } from 'winston'
import Capabilities from './capabilities'
import Config from './config'
import ParseProxy from './proxy'
import { Configuration, JSON, Project, SideRunnerAPI } from './types'
import buildRunners from './run'

const metadata = require('../package.json')

const DEFAULT_TIMEOUT = 15000

process.title = metadata.name

const program: SideRunnerAPI = new Command() as SideRunnerAPI
program
  .usage('[options] project.side [project.side] [*.side]')
  .version(metadata.version)
  .option('-c, --capabilities [list]', 'Webdriver capabilities')
  .option('-s, --server [url]', 'Webdriver remote server')
  .option('-p, --params [list]', 'General parameters')
  .option('-f, --filter [string]', 'Run suites matching name')
  .option(
    '-w, --max-workers [number]',
    'Maximum amount of workers that will run your tests, defaults to number of cores'
  )
  .option('--base-url [url]', 'Override the base URL that was set in the IDE')
  .option(
    '--timeout [number | undefined]',
    `The maximimum amount of time, in milliseconds, to spend attempting to locate an element. (default: ${DEFAULT_TIMEOUT})`
  )
  .option(
    '--proxy-type [type]',
    'Type of proxy to use (one of: direct, manual, pac, socks, system)'
  )
  .option(
    '--proxy-options [list]',
    'Proxy options to pass, for use with manual, pac and socks proxies'
  )
  .option(
    '--config, --config-file [filepath]',
    'Use specified YAML file for configuration. (default: .side.yml)'
  )
  .option(
    '--output-directory [directory]',
    'Write test results to files, format is defined by --output-format'
  )
  .option(
    '--output-format [jest | junit]',
    'Format for the output. (default: jest)'
  )
  .option(
    '--force',
    "Forcibly run the project, regardless of project's version"
  )
  .option('--debug', 'Print debug logs')

if (process.env.NODE_ENV === 'development') {
  program.option(
    '-e, --extract',
    'Only extract the project file to code (this feature is for debugging purposes)'
  )
  program.option(
    '-r, --run [directory]',
    'Run the extracted project files (this feature is for debugging purposes)'
  )
}

program.parse(process.argv)

if (!program.args.length) {
  program.outputHelp()
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}

const logger = createLogger({
  level: program.debug ? 'debug' : 'info',
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
})

if (program.extract || program.run) {
  logger.warn(
    "This feature is used by Selenium IDE maintainers for debugging purposes, we hope you know what you're doing!"
  )
}

const configuration: Configuration = {
  baseUrl: '',
  capabilities: {
    browserName: 'chrome',
  },
  params: {},
  proxyOptions: {},
  runId: crypto.randomBytes(16).toString('hex'),
  path: path.join(__dirname, '../../'),
  server: '',
  timeout: 0,
}

const confPath = program.configFile || '.side.yml'
const configFilePath = path.isAbsolute(confPath)
  ? confPath
  : path.join(process.cwd(), confPath)
try {
  Object.assign(configuration, Config.load(configFilePath))
} catch (e) {
  logger.debug('Could not load ' + configFilePath)
}

program.filter = program.filter || '*'
configuration.server = program.server ? program.server : configuration.server

configuration.timeout = program.timeout
  ? +program.timeout
  : configuration.timeout
  ? +configuration.timeout
  : DEFAULT_TIMEOUT // eslint-disable-line indent

// @ts-expect-error
if (configuration.timeout === 'undefined') {
  configuration.timeout = undefined
}

if (program.capabilities) {
  try {
    configuration.capabilities = Capabilities.parseString(program.capabilities)
  } catch (e) {
    logger.debug('Failed to parse inline capabilities')
  }
}

if (program.params) {
  try {
    configuration.params = Capabilities.parseString(program.params)
  } catch (e) {
    logger.debug('Failed to parse additional params')
  }
}

if (program.proxyType) {
  try {
    let opts
    if (program.proxyType === 'manual' || program.proxyType === 'socks') {
      opts = Capabilities.parseString(program.proxyOptions as string)
    }
    const proxy = ParseProxy(program.proxyType, opts as Record<string, JSON>)
    Object.assign(configuration, proxy)
  } catch (e) {
    logger.error((e as Error).message)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
} else if (configuration.proxyType) {
  try {
    const proxy = ParseProxy(
      configuration.proxyType,
      configuration.proxyOptions
    )
    Object.assign(configuration, proxy)
  } catch (e) {
    logger.error((e as Error).message)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

configuration.baseUrl = program.baseUrl
  ? program.baseUrl
  : configuration.baseUrl

logger.debug(util.inspect(configuration))

function handleQuit(_signal: string, code: number) {
  // eslint-disable-next-line no-process-exit
  process.exit(code)
}
process.on('SIGINT', handleQuit)
process.on('SIGTERM', handleQuit)

const projects: Project[] = [
  ...program.args.reduce((projects, project) => {
    glob.sync(project).forEach((p) => {
      projects.add(p)
    })
    return projects
  }, new Set<string>()),
].map((p) => {
  const project = JSON.parse(fs.readFileSync(p, 'utf8'))
  project.path = p
  return project
})

const runners = buildRunners({
  configuration,
  logger: logger as unknown as Console,
  program,
})

runners.all(projects)
