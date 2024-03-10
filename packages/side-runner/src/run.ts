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
import { TestShape } from '@seleniumhq/side-model'
import fs from 'fs/promises'
import path from 'path'
import { Configuration, Project } from './types'

export interface HoistedThings {
  configuration: Configuration
  logger: Console
}

export interface TestRunner {
  getDriverSync: () => ReturnType<
    typeof WebDriverExecutor.prototype.getDriverSync
  >
  run: (
    project: Project,
    test: TestShape,
    variables?: Variables,
    persistedDriver?: WebDriverExecutor['driver']
  ) => Promise<void>
}

const buildRun = ({ configuration, logger }: HoistedThings): TestRunner => ({
  getDriverSync: () => {
    const executor = new WebDriverExecutor({
      capabilities: JSON.parse(
        JSON.stringify(configuration.capabilities)
      ) as unknown as WebDriverExecutorConstructorArgs['capabilities'],
      server: configuration.server,
    })
    return executor.getDriverSync({
      debug: configuration.debugConnectionMode,
      logger,
    })
  },
  run: async (
    project: Project,
    test: TestShape,
    variables = new Variables(),
    persistedDriver?: WebDriverExecutor['driver']
  ) => {
    logger.info(`Running test ${test.name}`)
    const pluginPaths = correctPluginPaths(project.path, project?.plugins ?? [])
    const plugins = await loadPlugins(pluginPaths)
    const customCommands = getCustomCommands(plugins)
    const executor = new WebDriverExecutor({
      capabilities: JSON.parse(
        JSON.stringify(configuration.capabilities)
      ) as unknown as WebDriverExecutorConstructorArgs['capabilities'],
      customCommands,
      driver: persistedDriver,
      hooks: {
        onBeforePlay: async () => {
          await Promise.all(
            plugins.map((plugin) => {
              const onBeforePlay = plugin.hooks?.onBeforePlay
              if (onBeforePlay) {
                return onBeforePlay({ driver: executor })
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
          executor,
          getTestByName: (name: string) =>
            project.tests.find((t) => t.name === name) as TestShape,
          logger,
          variables,
        })
        const onComplete = async (failure: any) => {
          // I know this feature is over aggressive for a tool to be deprecated
          // but I can't figure out whats going wrong at {{paid work}} and I
          // need this so just please don't ask me to expand on it because I
          // don't want to own screenshotting in tool tbh. That is perfect for
          // plugins.
          if (failure && configuration.screenshotFailureDirectory) {
            try {
              const crashScreen = await executor.driver.takeScreenshot()
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
          await playback.cleanup(Boolean(persistedDriver))
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
                if (state === 'finished') {
                  return onComplete(null)
                }
                logger.debug(
                  'Last command:',
                  playback['state'].lastSentCommandState?.command
                )
                return onComplete(
                  playback['state'].lastSentCommandState?.error ||
                    new Error('Unknown error')
                )
            }
            return
          }
        )
        EE.addListener(
          PlaybackEvents.COMMAND_STATE_CHANGED,
          ({
            command,
            state,
          }: PlaybackEventShapes['COMMAND_STATE_CHANGED']) => {
            const cmd = command
            const niceString = [cmd.command, cmd.target, cmd.value]
              .filter((v) => !!v)
              .join('|')
            logger.debug(`${state} ${niceString}`)
          }
        )
        try {
          await playback.play(test, {
            startingCommandIndex: 0,
          })
        } catch (e) {
          await playback.cleanup(Boolean(persistedDriver))
          return reject(e)
        }
      })
    }
  },
})

export default buildRun
