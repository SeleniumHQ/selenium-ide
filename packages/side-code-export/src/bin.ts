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

import path from 'path'
import { Command } from 'commander'
import * as fileWriter from './file-writer'
import { ProjectShape } from '@seleniumhq/side-model'

const metadata = require('../package.json')

process.title = metadata.name

export interface SideCodeExportCLIConfig {
  // Override the base URL that was set in the IDE
  baseUrl: string
  // Print debug logs
  debug?: boolean
  // Export suites or tests matching name
  filter?: string
  mode?: 'test' | 'suite'
}

export type SideCodeExportAPI = Command & SideCodeExportCLIConfig

export type Configuration = Required<SideCodeExportCLIConfig> & {
  format: string
  project: string
}

const program: SideCodeExportAPI = new Command() as SideCodeExportAPI
program
  .usage('[options] your-format-path.js your-project-here.side output-dir-here')
  .version(metadata.version)
  .option('--base-url [url]', 'Override the base URL that was set in the IDE')
  .option(
    '-f, --filter [string]',
    `
      Export suites / tests matching name. Takes a regex without slashes.
      eg (^(hello|goodbye).*$)
    `
  )
  .option(
    '-m, --mode [test|suite]',
    `
      Will either export one test per file or one suite per file.
      Default is one file per suite.
    `
  )
  .option('-d, --debug', 'Print debug logs')

program.parse()

if (program.args.length < 2) {
  program.outputHelp()
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}

const options = program.opts()
const [formatPath, projectPath, outputDir] = program.args
const configuration: Configuration = {
  baseUrl: '',
  debug: options.debug,
  filter: options.filter || '.*',
  format: path.isAbsolute(formatPath)
    ? formatPath
    : path.join(process.cwd(), formatPath),
  mode: options.mode || 'suite',
  // Convert all project paths into absolute paths
  project: path.isAbsolute(projectPath)
    ? projectPath
    : path.join(process.cwd(), projectPath),
}

const outputFormat = require(configuration.format)
const project = require(projectPath) as ProjectShape
const emitter =
  configuration.mode === 'suite' ? fileWriter.emitSuite : fileWriter.emitTest
const iteratee = configuration.mode === 'suite' ? project.suites : project.tests

iteratee.forEach(async (item) => {
  if (new RegExp(configuration.filter).test(item.name)) {
    const { body, filename } = await emitter(outputFormat, project, item.name)
    fileWriter.writeFile(path.join(outputDir, filename), body, project.url)
  }
})
