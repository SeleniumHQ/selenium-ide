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

import {
  correctPluginPaths,
  getCustomCommands,
  loadPlugins,
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
  Variables,
  WebDriverExecutor,
} from '@seleniumhq/side-runtime'
import { WebDriverExecutorConstructorArgs } from '@seleniumhq/side-runtime/dist/webdriver'
import { SuiteShape, TestShape } from '@seleniumhq/side-model'
import fs from 'fs/promises'
import path from 'path'
import Satisfies from './versioner'
import { Configuration, Project } from './types'

export interface HoistedThings {
  configuration: Configuration
  logger: Console
}

const buildRunners = ({ configuration, logger }: HoistedThings) => {
  const runTest = async (project: Project, test: TestShape) => {
    logger.info(`Running test ${test.name}`)
    const pluginPaths = correctPluginPaths(project.path, project?.plugins ?? [])
    const plugins = await loadPlugins(pluginPaths)
    const customCommands = getCustomCommands(plugins)
    const driver = new WebDriverExecutor({
      capabilities: JSON.parse(
        JSON.stringify(configuration.capabilities)
      ) as unknown as WebDriverExecutorConstructorArgs['capabilities'],
      customCommands,
      hooks: {
        onBeforePlay: async () => {
          await Promise.all(
            plugins.map((plugin) => {
              const onBeforePlay = plugin.hooks?.onBeforePlay
              if (onBeforePlay) {
                return onBeforePlay({ driver })
              }
            })
          )
        },
      },
      implicitWait: configuration.timeout,
      server: configuration.server,
    })
    await playbackUntilComplete()
    function playbackUntilComplete() {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const playback = new Playback({
          baseUrl: configuration.baseUrl || project.url,
          executor: driver,
          getTestByName: (name: string) =>
            project.tests.find((t) => t.name === name) as TestShape,
          logger,
          variables: new Variables(),
        })
        const onComplete = async (failure: any) => {
          // I know this feature is over aggressive for a tool to be deprecated
          // but I can't figure out whats going wrong at {{paid work}} and I
          // need this so just please don't ask me to expand on it because I
          // don't want to own screenshotting in tool tbh. That is perfect for
          // plugins.
          if (failure && configuration.screenshotFailureDirectory) {
            try {
              const crashScreen = await driver.driver.takeScreenshot()
              await fs.writeFile(
                path.join(
                  configuration.screenshotFailureDirectory,
                  `${test.name}_${Date.now()}.png`
                ),
                crashScreen,
                'base64'
              )
            } catch (e) {
              console.log('Failed to take screenshot', e)
            }
          }
          await playback.cleanup()
          await driver.cleanup()
          if (failure) {
            return reject(failure)
          } else {
            return resolve(null)
          }
        }
        const EE = playback['event-emitter']
        EE.addListener(
          PlaybackEvents.PLAYBACK_STATE_CHANGED,
          ({ state }: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']) => {
            logger.debug(`Playing state changed ${state} for test ${test.name}`)
            switch (state) {
              case 'aborted':
              case 'errored':
              case 'failed':
              case 'finished':
              case 'paused':
              case 'stopped':
                logger.info(
                  `Finished test ${test.name} ${
                    state === 'finished' ? 'Success' : 'Failure'
                  }`
                )
                if (state !== 'finished') {
                  logger.info(
                    'Last command:',
                    playback['state'].lastSentCommandState?.command
                  )
                  return onComplete(
                    playback['state'].lastSentCommandState?.error ||
                      new Error('Unknown error')
                  )
                }
                return onComplete(null)
            }
            return
          }
        )
        EE.addListener(
          PlaybackEvents.COMMAND_STATE_CHANGED,
          ({
            command,
            message,
            state,
          }: PlaybackEventShapes['COMMAND_STATE_CHANGED']) => {
            const cmd = command
            const niceString = [cmd.command, cmd.target, cmd.value]
              .filter((v) => !!v)
              .join('|')
            logger.debug(`${state} ${niceString}`)
            if (message) {
              logger.error(message)
            }
          }
        )
        try {
          await playback.play(test, {
            startingCommandIndex: 0,
          })
        } catch (e) {
          await playback.cleanup()
          return reject(e)
        }
      })
    }
  }

  const runSuite = async (project: Project, suite: SuiteShape) => {
    logger.info(`Running suite ${suite.name}`)
    if (!suite.tests.length) {
      throw new Error(
        `The suite ${suite.name} has no tests, add tests to the suite using the IDE.`
      )
    }
    for (let i = 0, ii = suite.tests.length; i != ii; i++) {
      await runTest(
        project,
        project.tests.find((t) => t.id === suite.tests[i]) as TestShape
      )
    }
    logger.info(`Finished suite ${suite.name}`)
  }

  const runProject = async (project: Project) => {
    logger.info(`Running project ${project.name}`)
    if (!configuration.force) {
      let warning = Satisfies(project.version, '2.0')
      if (warning) {
        logger.warn(warning)
      }
    } else {
      logger.warn("--force is set, ignoring project's version")
    }
    if (!project.suites.length) {
      throw new Error(
        `The project ${project.name} has no test suites defined, create a suite using the IDE.`
      )
    }

    for (let i = 0, ii = project.suites.length; i != ii; i++) {
      await runSuite(project, project.suites[i])
    }
    logger.info(`Finished project ${project.name}`)
  }

  const runAll = async (projects: Project[]) => {
    for (let i = 0, ii = projects.length; i != ii; i++) {
      await runProject(projects[i])
    }
  }

  return {
    all: runAll,
    project: runProject,
    suite: runSuite,
    test: runTest,
  }
}

export default buildRunners
