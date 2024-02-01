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

import { spawn } from 'child_process'
import { Command } from 'commander'
import crypto from 'crypto'
import fs from 'fs'
import merge from 'lodash/fp/merge'
import os from 'os'
import path from 'path'
import resolveBin from 'resolve-bin'
import util from 'util'
import Capabilities from './capabilities'
import Config from './config'
import ParseProxy from './proxy'
import { Configuration, SideRunnerAPI } from './types'

const metadata = require('../package.json')

const DEFAULT_TIMEOUT = 15000

process.title = metadata.name

const program: SideRunnerAPI = new Command() as SideRunnerAPI
program
  .usage(
    '[options] your-project-glob-here-*.side [variadic-project-globs-*.side]'
  )
  .version(metadata.version)
  .option('--base-url [url]', 'Override the base URL that was set in the IDE')
  .option('-c, --capabilities [list]', 'Webdriver capabilities')
  .option(
    '-j, --jest-options [list]',
    'Options to configure Jest, wrap in extra quotes to allow shell to process',
    '""'
  )
  .option('-s, --server [url]', 'Webdriver remote server')
  .option(
    '-r, --retries [number]',
    'Retry tests N times on failures, thin wrapper on jest.retryTimes',
    (str) => parseInt(str),
    0
  )
  .option(
    '-f, --filter [string]',
    'Run suites matching name, takes a regex without slashes, eg (^(hello|goodbye).*$)'
  )
  .option(
    '-w, --max-workers [number]',
    `Maximum amount of workers that will run your tests, defaults to number of cores`,
    (str) => parseInt(str)
  )
  .option(
    '-t, --timeout [number]',
    `The maximimum amount of time, in milliseconds, to spend attempting to locate an element. (default: ${DEFAULT_TIMEOUT})`,
    (str) => parseInt(str),
    DEFAULT_TIMEOUT
  )
  .option(
    '-T, --jest-timeout [number]',
    `The maximimum amount of time, in milliseconds, to wait for a test to finish. (default: 60000)`,
    (str) => parseInt(str),
    60000
  )
  .option(
    '-x, --proxy-type [type]',
    'Type of proxy to use (one of: direct, manual, pac, socks, system)'
  )
  .option(
    '-y, --proxy-options [list]',
    'Proxy options to pass, for use with manual, pac and socks proxies'
  )
  .option(
    '-n, --config-file [filepath]',
    'Use specified YAML file for configuration. (default: .side.yml)'
  )
  .option(
    '-o, --output-directory [directory]',
    'Write test results as json to file in specified directory. Name will be based on timestamp.'
  )
  .option(
    '-z, --screenshot-failure-directory [directory]',
    'Write screenshots of failed tests to file in specified directory. Name will be based on test + timestamp.'
  )
  .option(
    '-f, --force',
    "Forcibly run the project, regardless of project's version"
  )
  .option('-d, --debug', 'Print debug logs')
  .option('-D, --debug-startup', 'Print debug startup logs')
  .option('-X, --debug-connection-mode', 'Debug driver connection mode')

program.parse()

if (!program.args.length) {
  program.outputHelp()
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}
const options = program.opts()

let configuration: Configuration = {
  baseUrl: '',
  capabilities: {
    browserName: 'chrome',
  },
  debug: options.debug,
  debugConnectionMode: options.debugConnectionMode,
  debugStartup: options.debugStartup,
  filter: options.filter || '.*',
  force: options.force,
  maxWorkers: os.cpus().length,
  screenshotFailureDirectory: options.screenshotFailureDirectory,
  // Convert all project paths into absolute paths
  projects: [],
  proxyOptions: {},
  proxyType: undefined,
  retries: options.retries,
  runId: crypto.randomBytes(16).toString('hex'),
  path: path.join(__dirname, '../../'),
  server: '',
  jestTimeout: options.jestTimeout,
  timeout: DEFAULT_TIMEOUT,
}

const confPath = options.configFile || '.side.yml'
const configFilePath = path.isAbsolute(confPath)
  ? confPath
  : path.join(process.cwd(), confPath)
try {
  const configFileSettings = Config.load(configFilePath)
  configuration = merge(configuration, configFileSettings)
} catch (e) {
  const err = e as any
  if (options.configFile || err.code !== 'ENOENT') {
    console.warn(err)
    throw new Error('Could not load ' + configFilePath)
  }
}

configuration = merge(configuration, {
  baseUrl: options.baseUrl,
  capabilities: Capabilities.parseString(options.capabilities),
  debug: options.debug,
  maxWorkers: options.maxWorkers,
  // Convert all project paths into absolute paths
  projects: program.args.map((arg) => {
    if (path.isAbsolute(arg)) return arg
    return path.join(process.cwd(), arg)
  }),
  proxyType: options.proxyType,
  proxyOptions:
    options.proxyType === 'manual' || options.proxyType === 'socks'
      ? Capabilities.parseString(options.proxyOptions)
      : options.proxyOptions,
  server: options.server,
  timeout: options.timeout,
})

if (configuration.proxyType) {
  const proxy = ParseProxy(configuration.proxyType, configuration.proxyOptions)
  configuration.capabilities.proxy = proxy
}

const outputFilename =
  'results-' + new Date().toISOString().replace(/:/g, '-') + '.json'
if (options.outputDirectory) {
  if (!fs.existsSync(options.outputDirectory)) {
    fs.mkdirSync(options.outputDirectory, { recursive: true })
  }
  const outputFile = path.join(options.outputDirectory, outputFilename)
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, '')
  }
}

if (options.screenshotFailureDirectory) {
  if (!fs.existsSync(options.screenshotFailureDirectory)) {
    fs.mkdirSync(options.screenshotFailureDirectory, { recursive: true })
  }
}

configuration.debugStartup &&
  console.debug('Configuration:', util.inspect(configuration))

// All the stuff that goes into a big wrapped jest command
const jest = 'node ' + resolveBin.sync('jest')
const jestArgs = [
  '--config=' + path.join(__dirname, '..', 'runner.jest.config.js'),
  '--maxConcurrency=' + configuration.maxWorkers,
]
  .concat(
    options.outputDirectory
      ? [
          '--json',
          '--outputFile=' + path.join(options.outputDirectory, outputFilename),
        ]
      : []
  )
  .concat(options.jestOptions.slice(1, -1).split(' ').filter(Boolean))
  .concat(['--runTestsByPath', path.join(__dirname, 'main.test.js')])

const jestEnv = {
  ...process.env,
  SE_CONFIGURATION: JSON.stringify(configuration),
}

configuration.debugStartup &&
  console.debug('Jest command:', jest, jestArgs, jestEnv)
spawn(jest, jestArgs, {
  cwd: process.cwd(),
  env: jestEnv,
  shell: true,
  stdio: 'inherit',
}).on('exit', (code) => {
  // This is my bin, my process
  // eslint-disable-next-line no-process-exit
  process.exit(code as number)
})
