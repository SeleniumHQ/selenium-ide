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
import { fork } from 'child_process'
import program from 'commander'
import winston from 'winston'
import glob from 'glob'
import rimraf from 'rimraf'
import { js_beautify as beautify } from 'js-beautify'
import Selianize, { getUtilsFile } from 'selianize'
import Capabilities from './capabilities'
import ParseProxy from './proxy'
import Config from './config'
import Satisfies from './versioner'
import parseModulePath from './module-path'
import metadata from '../package.json'
import { sanitizeFileName } from './util'

const DEFAULT_TIMEOUT = 15000

process.title = metadata.name

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

if (!program.args.length && !program.run) {
  program.outputHelp()
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}

winston.cli()
winston.level = program.debug ? 'debug' : 'info'

if (program.extract || program.run) {
  winston.warn(
    "This feature is used by Selenium IDE maintainers for debugging purposes, we hope you know what you're doing!"
  )
}

const configuration = {
  capabilities: {
    browserName: 'chrome',
  },
  params: {},
  runId: crypto.randomBytes(16).toString('hex'),
  path: path.join(__dirname, '../../'),
}

const confPath = program.configFile || '.side.yml'
const configFilePath = path.isAbsolute(confPath)
  ? confPath
  : path.join(process.cwd(), confPath)
try {
  Object.assign(configuration, Config.load(configFilePath))
} catch (e) {
  winston.debug('Could not load ' + configFilePath)
}

program.filter = program.filter || '*'
configuration.server = program.server ? program.server : configuration.server

configuration.timeout = program.timeout
  ? +program.timeout
  : configuration.timeout
    ? +configuration.timeout
    : DEFAULT_TIMEOUT // eslint-disable-line indent

if (configuration.timeout === 'undefined') configuration.timeout = undefined

if (program.capabilities) {
  try {
    configuration.capabilities = Capabilities.parseString(program.capabilities)
  } catch (e) {
    winston.debug('Failed to parse inline capabilities')
  }
}

if (program.params) {
  try {
    configuration.params = Capabilities.parseString(program.params)
  } catch (e) {
    winston.debug('Failed to parse additional params')
  }
}

if (program.proxyType) {
  try {
    let opts = program.proxyOptions
    if (program.proxyType === 'manual' || program.proxyType === 'socks') {
      opts = Capabilities.parseString(opts)
    }
    const proxy = ParseProxy(program.proxyType, opts)
    Object.assign(configuration, proxy)
  } catch (e) {
    winston.error(e.message)
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
    winston.error(e.message)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

configuration.baseUrl = program.baseUrl
  ? program.baseUrl
  : configuration.baseUrl

configuration.outputFormat = () => ({
  jestArguments: [],
  jestConfiguration: {},
  packageJsonConfiguration: {},
})
if (program.outputDirectory) {
  const outputDirectory = path.isAbsolute(program.outputDirectory)
    ? program.outputDirectory
    : path.join('..', program.outputDirectory)
  const outputFormatConfigurations = {
    jest(project) {
      return {
        jestArguments: [
          '--json',
          '--outputFile',
          path.join(outputDirectory, `${project.name}.json`),
        ],
        jestConfiguration: {},
        packageJsonConfiguration: {},
      }
    },
    junit(project) {
      return {
        jestArguments: [],
        jestConfiguration: { reporters: ['default', 'jest-junit'] },
        packageJsonConfiguration: {
          'jest-junit': {
            outputDirectory: outputDirectory,
            outputName: `${project.name}.xml`,
          },
        },
      }
    },
  }
  const format = program.outputFormat ? program.outputFormat : 'jest'
  configuration.outputFormat = outputFormatConfigurations[format]
  if (!configuration.outputFormat) {
    const allowedFormats = Object.keys(outputFormatConfigurations).join(', ')
    winston.error(
      `'${format}'is not an output format, allowed values: ${allowedFormats}`
    )
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

winston.debug(util.inspect(configuration))

let projectPath

function runProject(project) {
  winston.info(`Running ${project.path}`)
  if (!program.force) {
    let warning
    try {
      warning = Satisfies(project.version, '2.0')
    } catch (e) {
      return Promise.reject(e)
    }
    if (warning) {
      winston.warn(warning)
    }
  } else {
    winston.warn("--force is set, ignoring project's version")
  }
  if (!project.suites.length) {
    return Promise.reject(
      new Error(
        `The project ${
          project.name
        } has no test suites defined, create a suite using the IDE.`
      )
    )
  }
  projectPath = `side-suite-${sanitizeFileName(project.name)}`
  if (!project.dependencies) project.dependencies = {}
  if (program.outputFormat) project.dependencies['jest-junit'] = '^6.4.0'
  rimraf.sync(projectPath)
  fs.mkdirSync(projectPath)
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(
      {
        name: sanitizeFileName(project.name),
        version: '0.0.0',
        jest: {
          extraGlobals:
            project.jest && project.jest.extraGlobals
              ? project.jest.extraGlobals
              : [],
          modulePaths: parseModulePath(path.join(__dirname, '../node_modules')),
          setupFilesAfterEnv: [
            require.resolve('jest-environment-selenium/dist/setup.js'),
          ],
          testEnvironment: 'jest-environment-selenium',
          testEnvironmentOptions: configuration,
          ...configuration.outputFormat(project).jestConfiguration,
        },
        ...configuration.outputFormat(project).packageJsonConfiguration,
        dependencies: project.dependencies,
      },
      null,
      2
    )
  )

  return Selianize(project, { silenceErrors: true }, project.snapshot).then(
    code => {
      const tests = code.tests
        .reduce((tests, test) => {
          return (tests += test.code)
        }, 'const utils = require("./utils.js");const tests = {};')
        .concat('module.exports = tests;')
      writeJSFile(path.join(projectPath, 'commons'), tests, '.js')
      writeJSFile(path.join(projectPath, 'utils'), getUtilsFile(), '.js')
      code.suites.forEach(suite => {
        if (!suite.tests) {
          // not parallel
          const cleanup = suite.persistSession
            ? ''
            : 'beforeEach(() => {vars = {};});afterEach(async () => (cleanup()));'
          writeJSFile(
            path.join(projectPath, sanitizeFileName(suite.name)),
            `jest.setMock('selenium-webdriver', webdriver);\n// This file was generated using Selenium IDE\nconst tests = require("./commons.js");${
              code.globalConfig
            }${suite.code}${cleanup}`
          )
        } else if (suite.tests.length) {
          fs.mkdirSync(path.join(projectPath, sanitizeFileName(suite.name)))
          // parallel suite
          suite.tests.forEach(test => {
            writeJSFile(
              path.join(
                projectPath,
                sanitizeFileName(suite.name),
                sanitizeFileName(test.name)
              ),
              `jest.setMock('selenium-webdriver', webdriver);\n// This file was generated using Selenium IDE\nconst tests = require("../commons.js");${
                code.globalConfig
              }${test.code}`
            )
          })
        }
      })

      return new Promise((resolve, reject) => {
        let npmInstall
        if (project.dependencies && Object.keys(project.dependencies).length) {
          npmInstall = new Promise((resolve, reject) => {
            const child = fork(require.resolve('./npm'), {
              cwd: path.join(process.cwd(), projectPath),
              stdio: 'inherit',
            })
            child.on('exit', code => {
              if (code) {
                reject()
              } else {
                resolve()
              }
            })
          })
        } else {
          npmInstall = Promise.resolve()
        }
        npmInstall
          .then(() => {
            if (program.extract) {
              resolve()
            } else {
              runJest(project)
                .then(resolve)
                .catch(reject)
            }
          })
          .catch(reject)
      })
    }
  )
}

function runJest(project) {
  return new Promise((resolve, reject) => {
    const args = [
      '--no-watchman',
      '--testMatch',
      `{**/*${program.filter}*/*.test.js,**/*${program.filter}*.test.js}`,
    ]
      .concat(program.maxWorkers ? ['-w', program.maxWorkers] : [])
      .concat(configuration.outputFormat(project).jestArguments)
    const opts = {
      cwd: path.join(process.cwd(), projectPath),
      stdio: 'inherit',
    }
    winston.debug('jest worker args')
    winston.debug(args)
    winston.debug('jest work opts')
    winston.debug(opts)
    const child = fork(require.resolve('./child'), args, opts)

    child.on('exit', code => {
      console.log('') // eslint-disable-line no-console
      if (!program.run) {
        rimraf.sync(projectPath)
      }
      if (code) {
        reject()
      } else {
        resolve()
      }
    })
  })
}

function runAll(projects, index = 0) {
  if (index >= projects.length) return Promise.resolve()
  return runProject(projects[index])
    .then(() => {
      return runAll(projects, ++index)
    })
    .catch(error => {
      process.exitCode = 1
      error && winston.error(error.message + '\n')
      return runAll(projects, ++index)
    })
}

function writeJSFile(name, data, postfix = '.test.js') {
  fs.writeFileSync(`${name}${postfix}`, beautify(data, { indent_size: 2 }))
}

const projects = [
  ...program.args.reduce((projects, project) => {
    glob.sync(project).forEach(p => {
      projects.add(p)
    })
    return projects
  }, new Set()),
].map(p => {
  const project = JSON.parse(fs.readFileSync(p))
  project.path = p
  return project
})

function handleQuit(_signal, code) {
  if (!program.run) {
    rimraf.sync(projectPath)
  }
  // eslint-disable-next-line no-process-exit
  process.exit(code)
}

process.on('SIGINT', handleQuit)
process.on('SIGTERM', handleQuit)

if (program.run) {
  projectPath = program.run
  runJest({
    name: 'test',
  }).catch(winston.error)
} else {
  runAll(projects)
}
