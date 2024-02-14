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

import { ProjectShape, SuiteShape, TestShape } from '@seleniumhq/side-model'
import {
  correctPluginPaths,
  loadPlugins,
  PluginHooks,
  Variables,
} from '@seleniumhq/side-runtime'
import each from 'jest-each'
import fs from 'fs'
import { globSync } from 'glob'
import { createLogger, format, transports } from 'winston'
import { Configuration, Project } from './types'
import testConnection from './connect'
import buildRun from './run'

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
jest.setTimeout(configuration.jestTimeout)

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
    globSync(project).forEach((p) => {
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
const getTestByID = (project: ProjectShape) => (testID: string) =>
  project.tests.find((t) => t.id === testID) as TestShape

const runner = buildRun(factoryParams)

if (configuration.debugConnectionMode) {
  test('Testing driver connection', async () => {
    await testConnection(configuration)
  })
} else {
  let plugins: Awaited<ReturnType<typeof loadPlugins>> | undefined
  each(projects).describe(projectTitle, (project: Project) => {
    try {
      const pluginPaths = correctPluginPaths(
        project.path,
        project?.plugins ?? []
      )
      const runHook = (hookName: keyof PluginHooks) => async () => {
        if (!plugins) {
          plugins = await loadPlugins(pluginPaths)
        }
        await Promise.all(
          plugins!.map(async (plugin) => {
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
          suite.tests.length &&
          new RegExp(configuration.filter).test(suite.name)
      )
      if (suites.length) {
        each(suites).describe(suiteTitle, (suite: SuiteShape) => {
          const isParallel = suite.parallel
          const suiteVariables = new Variables()
          const tests = suite.tests.map(getTestByID(project))

          const testExecutor = each(tests)
          const testMethod = isParallel
            ? testExecutor.test.concurrent
            : testExecutor.test

          const persistedDriver = suite.persistSession
            ? runner.getDriverSync()
            : undefined
          testMethod(testTitle, async (test: TestShape) => {
            await runner.run(
              project,
              test,
              suite.persistSession ? suiteVariables : new Variables(),
              await (persistedDriver || Promise.resolve(undefined))
            )
          })
        })
      } else {
        console.info(`
          Project ${project.name} doesn't have any suites matching filter ${configuration.filter},
          attempting to iterate all tests in project
        `)
        const tests = project.tests.filter((test) =>
          new RegExp(configuration.filter).test(test.name)
        )
        if (!tests.length) {
          throw new Error(
            `No suites or tests found in project ${project.name} matching filter ${configuration.filter}, unable to test!`
          )
        }
        const testExecutor = each(tests)
        testExecutor.test(testTitle, async (test: TestShape) => {
          await runner.run(project, test, new Variables())
        })
      }
    } catch (e) {
      console.warn('Failed to run project ' + project.name)
      console.error(e)
    }
  })
}
