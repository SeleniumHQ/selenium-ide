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
  getCustomCommands,
  loadPlugins,
  Playback,
  PlaybackEvents,
  PlaybackState,
  Variables,
  WebDriverExecutor,
} from '@seleniumhq/side-runtime'
import { WebDriverExecutorConstructorArgs } from '@seleniumhq/side-runtime/dist/webdriver'
import { SuiteShape, TestShape } from '@seleniumhq/side-model'
import * as path from 'path'
import Satisfies from './versioner'
import { Configuration, Project, SideRunnerAPI } from './types'

export interface HoistedThings {
  configuration: Configuration
  logger: Console
  program: SideRunnerAPI
}

const buildRunners = ({ configuration, logger, program }: HoistedThings) => {
  const runTest = async (project: Project, test: TestShape) => {
    logger.info(`Running test ${test.name}`)
    const shortenedProjectPath = project.path
      .split(path.sep)
      .slice(0, -1)
      .join(path.sep)
    const plugins = await loadPlugins(require, shortenedProjectPath, project)
    const customCommands = await getCustomCommands(plugins)
    const driver = new WebDriverExecutor({
      capabilities:
        configuration.capabilities as unknown as WebDriverExecutorConstructorArgs['capabilities'],
      customCommands,
      hooks: {
        onBeforePlay: async () => {
          await Promise.all(
            plugins.map((plugin) => {
              const onBeforePlay = plugin.hooks.onBeforePlay
              if (onBeforePlay) {
                return onBeforePlay({ driver })
              }
            })
          )
        },
      },
      server: configuration.server,
    })
    const playback = new Playback({
      baseUrl: project.url,
      executor: driver,
      getTestByName: (name: string) =>
        project.tests.find((t) => t.name === name) as TestShape,
      logger: console,
      variables: new Variables(),
    })
    const EE = playback['event-emitter']
    EE.addListener(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      ({ state }: { state: PlaybackState }) => {
        logger.info(`Playing state changed ${state}`)
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
        }
      }
    )
    EE.addListener(PlaybackEvents.COMMAND_STATE_CHANGED, ({ id, state }) => {
      logger.info(`Playing command state changed ${id} ${state}`)
    })
    playback.play(test, {
      startingCommandIndex: 0,
    })
  }

  const runSuite = async (project: Project, suite: SuiteShape) => {
    logger.info(`Running suite ${suite.name}`)
    if (!project.suites.length) {
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
    if (!program.force) {
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
