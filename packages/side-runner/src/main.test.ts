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
import glob from 'glob'
import { createLogger, format, transports } from 'winston'
import { Configuration, Project } from './types'
import buildRegister from './register'
import buildRunners from './run'
import { ProjectShape, SuiteShape, TestShape } from '@seleniumhq/side-model'
import {
  correctPluginPaths,
  loadPlugins,
  PluginHooks,
} from '@seleniumhq/side-runtime'

const metadata = require('../package.json')

process.title = metadata.name

// Capture and show unhandled exceptions
process.on('unhandledRejection', function handleWarning(reason) {
  console.log('[PROCESS] Unhandled Promise Rejection')
  console.log('- - - - - - - - - - - - - - - - - - -')
  console.log(reason)
  console.log('- -')
})

process.on('uncaughtException', (error) => {
  console.error('Unhandled Error', error)
})

const configuration: Configuration = JSON.parse(
  process.env.SE_CONFIGURATION as string
)

if (configuration.retries > 0) {
  jest.retryTimes(configuration.retries)
}
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

const projectTitle = 'Running project $name'
const suiteTitle = 'Running suite $name'
const testTitle = 'Running test $name'

const allMatchingProjects: Project[] = [
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

if (!allMatchingProjects.length) {
  throw new Error(
    'No matching projects found, supplied filepaths: ' +
      configuration.projects.join(', ')
  )
}

const projects = allMatchingProjects.filter((p: ProjectShape) => {
  const projectIsFound = Boolean(p)
  if (projectIsFound) {
    const hasSuites = p.suites.filter(
      (suite) =>
        suite.tests.length && new RegExp(configuration.filter).test(suite.name)
    ).length
    if (hasSuites) {
      return true
    }
    const hasTests = p.tests.filter((test) =>
      new RegExp(configuration.filter).test(test.name)
    ).length
    if (hasTests) {
      return true
    }
  }
  return false
})
if (!projects.length) {
  throw new Error(
    'No matching suites or tests found for filter in any projects, supplied filter: ' +
      configuration.filter
  )
}

const factoryParams = {
  configuration,
  logger: logger as unknown as Console,
}
const register = buildRegister(factoryParams)
const runners = buildRunners(factoryParams)
each(projects).describe(projectTitle, (project: Project) => {
  try {
    const pluginPaths = correctPluginPaths(project.path, project.plugins)
    const runHook = (hookName: keyof PluginHooks) => async () => {
      const plugins = await loadPlugins(pluginPaths)
      await Promise.all(
        plugins.map(async (plugin) => {
          const hook = plugin.hooks?.[hookName]
          if (hook) {
            await hook({ ...factoryParams, project })
          }
        })
      )
    }
    beforeAll(runHook('onBeforePlayAll'))
    afterAll(runHook('onAfterPlayAll'))
    const suites = project.suites.filter(
      (suite) =>
        suite.tests.length && new RegExp(configuration.filter).test(suite.name)
    )
    if (suites.length) {
      each(suites).describe(suiteTitle, (suite: SuiteShape) => {
        const isParallel = suite.parallel
        const tests = suite.tests.map((tID) => register.test(project, tID))

        const testExecutor = each(tests)
        const testMethod = isParallel
          ? testExecutor.test.concurrent
          : testExecutor.test
        testMethod(testTitle, async (test: TestShape) => {
          await runners.test(project, test)
        })
      })
    } else {
      console.info(`
      Project ${project.name} doesn't have any suites matching filter ${configuration.filter},
      attempting to iterate all tests in project
    `)
      const tests = project.tests
        .map((test) => register.test(project, test.id))
        .filter((test) => new RegExp(configuration.filter).test(test.name))
      if (!tests.length) {
        throw new Error(
          `No suites or tests found in project ${project.name} matching filter ${configuration.filter}, unable to test!`
        )
      }
      const testExecutor = each(tests)
      testExecutor.test(testTitle, async (test: TestShape) => {
        await runners.test(project, test)
      })
    }
  } catch (e) {
    console.warn('Failed to run project ' + project.name)
    console.error(e)
  }
})
