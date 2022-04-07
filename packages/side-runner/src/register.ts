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
import Satisfies from './versioner'
import { Configuration, Project } from './types'

export interface HoistedThings {
  configuration: Configuration
  logger: Console
}

export type SuiteArgs = [SuiteShape, TestShape[]]
export type ProjectArgs = [ProjectShape, SuiteArgs[]]
const buildRunners = ({ configuration, logger }: HoistedThings) => {
  const registerTest = (project: Project, testID: string) =>
    project.tests.find((t) => t.id === testID) as TestShape

  const registerSuite = (project: Project, suite: SuiteShape): SuiteArgs => {
    let tests: TestShape[] = []
    for (let i = 0, ii = suite.tests.length; i != ii; i++) {
      tests.push(registerTest(project, suite.tests[i]))
    }
    return [suite, tests]
  }

  const registerProject = (project: Project): ProjectArgs => {
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

    const suites: SuiteArgs[] = []
    for (let i = 0, ii = project.suites.length; i != ii; i++) {
      suites.push(registerSuite(project, project.suites[i]))
    }
    return [project, suites]
  }

  const registerAll = (projectConfigs: Project[]): ProjectArgs[] => {
    const projects: ProjectArgs[] = []
    for (let i = 0, ii = projectConfigs.length; i != ii; i++) {
      projects.push(registerProject(projectConfigs[i]))
    }
    return projects
  }

  return {
    all: registerAll,
    project: registerProject,
    suite: registerSuite,
    test: registerTest,
  }
}

export default buildRunners
