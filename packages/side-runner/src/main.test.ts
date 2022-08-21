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

import each from 'jest-each'
import fs from 'fs'
import util from 'util'
import glob from 'glob'
import { createLogger, format, transports } from 'winston'
import { Configuration, Project } from './types'
import buildRegister from './register'
import buildRunners from './run'
import { SuiteShape } from '@seleniumhq/side-model'

const metadata = require('../package.json')

process.title = metadata.name

const configuration: Configuration = JSON.parse(
  process.env.SE_CONFIGURATION as string
)

// Jest timeout should be really far back, otherwise it will impede people
// When working right, we should close shop and detonate on our own much sooner
jest.setTimeout(60 * 60 * 1000) // 60 minutes before we just cut it off

const logger = createLogger({
  level: configuration.debug ? 'debug' : 'info',
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
})

logger.debug(util.inspect(configuration))

describe('Running all of the selected projects', () => {
  const projects: Project[] = [
    ...configuration.projects.reduce((projects, project) => {
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
  const factoryParams = {
    configuration,
    logger: logger as unknown as Console,
  }
  const register = buildRegister(factoryParams)
  const runners = buildRunners(factoryParams)
  each(projects).describe('Running project $name', (project: Project) => {
    each(project.suites).describe(
      'Running suite $name',
      (suite: SuiteShape) => {
        each(suite.tests.map((tID) => register.test(project, tID))).test(
          'Running tests $name',
          async (test) => {
            await runners.test(project, test)
          }
        )
      }
    )
  })
})
