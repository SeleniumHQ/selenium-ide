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

import type { ExportFlexCommandShape } from './emit'
import prettify, { PrettifyOutput } from './prettify'

export interface RenderOptions {
  startingLevel?: number
  newLineCount?: number
  fullPayload?: boolean
  originTracing?: string[]
  enableOriginTracing?: boolean
}

export type PartialRenderParameters = [
  ExportFlexCommandShape | ExportFlexCommandShape[],
  RenderOptions
]

export type RenderParameters = [string, ...PartialRenderParameters]

export type RenderCommand = (
  ...args: RenderParameters
) => string | PrettifyOutput

export const renderCommand: RenderCommand = (
  commandPrefixPadding,
  input,
  {
    startingLevel = 0,
    newLineCount = 1,
    fullPayload = false,
    originTracing = [],
    enableOriginTracing = false,
  } = {}
) => {
  if (Array.isArray(input)) {
    // e.g., the emitted commands of a test, to be stitched together
    return renderCommands(input, {
      startingLevel,
      commandPrefixPadding,
      originTracing,
      enableOriginTracing,
    })
  }
  const result = prettify(input, {
    commandPrefixPadding,
    startingLevel,
  })
  if (fullPayload) return result
  return result.body && result.body.length
    ? result.body + '\n'.repeat(newLineCount)
    : ''
}

export type RenderCommandsOptions = Pick<
  RenderOptions,
  'enableOriginTracing' | 'startingLevel' | 'originTracing'
> & {
  commandPrefixPadding: string
}

export type RenderCommandsParameters = [
  ExportFlexCommandShape[],
  RenderCommandsOptions
]

export type RenderCommands = (...args: RenderCommandsParameters) => string

export const renderCommands: RenderCommands = (
  commands,
  {
    startingLevel,
    commandPrefixPadding,
    originTracing = [],
    enableOriginTracing,
  }
) => {
  let result = ''
  let endingLevel = startingLevel

  if (enableOriginTracing) {
    const originTitle = originTracing.splice(0, 2)
    result += renderCommand(commandPrefixPadding, originTitle.join('\n'), {
      startingLevel: endingLevel,
    })
  }
  // Each command starts at the level the previous one ended at
  commands.forEach((command, index) => {
    if (command) {
      if (originTracing && originTracing[index]) {
        let rows = originTracing[index].split('\n')
        rows.forEach((row) => {
          let originRecord = renderCommand(commandPrefixPadding, row, {
            startingLevel: endingLevel,
          })
          result += originRecord
        })
      }
      const commandBlock = prettify(command, {
        commandPrefixPadding,
        startingLevel: endingLevel,
      })
      endingLevel = commandBlock.endingLevel
      if (!commandBlock.skipEmitting) {
        result += commandBlock.body
        result += '\n'
      }
    }
  })
  return result
}

export default renderCommand
