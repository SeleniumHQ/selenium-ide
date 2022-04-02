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

import { ExportCommandShape, ExportCommandsShape } from '../types'
import { renderCommands } from './render'

export interface PrettifyOptions {
  startingLevel: number
  commandPrefixPadding: string
}

export type PrettifyParameters = [
  commandBlock: ExportCommandShape | ExportCommandsShape,
  opts: PrettifyOptions
]

export interface PrettifyOutput {
  body?: string
  endingLevel: number
  skipEmitting?: boolean
}

export type Prettify = (...args: PrettifyParameters) => PrettifyOutput
/**
 * Returns a prettified string with indentation and line-breaks based on inputs
 * @param {Object|string} commandBlock The input to be prettified
 * @param {Object} opts - The styling options
 * @param {number} opts.startingLevel The staring indentation level
 * @param {string} opts.commandPrefixPadding The padding to use for indentation
 * @returns {Object} The prettified result (e.g., `.body`) and the absolute
 * indentation level (e.g., `endingLevel`) for the next command to use
 */
const prettify: Prettify = (
  commandBlock,
  { startingLevel = 0, commandPrefixPadding }
) => {
  if (startingLevel < 0) startingLevel = 0
  if (commandBlock === undefined) {
    return { body: undefined, endingLevel: startingLevel }
  }
  const isStringCommand = typeof commandBlock === 'string'
  const isSingleCommand = isStringCommand || 'statement' in commandBlock
  if (isSingleCommand) {
    const command = isStringCommand ? commandBlock : commandBlock.statement
    const level = isStringCommand ? startingLevel : commandBlock.level
    return {
      body: command
        .split('\n')
        .join('\n' + commandPrefixPadding.repeat(level))
        .replace(/^/, commandPrefixPadding.repeat(level)),
      endingLevel: level,
    }
  }
  if (commandBlock.startingLevelAdjustment) {
    startingLevel += commandBlock.startingLevelAdjustment
  }
  if (commandBlock.skipEmitting) {
    return {
      endingLevel: calculateEndingLevel({
        startingLevel,
        commandBlock,
      }),
      skipEmitting: commandBlock.skipEmitting,
    }
  } else {
    return {
      body: renderCommands(commandBlock, {
        commandPrefixPadding,
        startingLevel,
      }),
      endingLevel: calculateEndingLevel({ startingLevel, commandBlock }),
    }
  }
}

export default prettify

export interface CalculateEndingLevelParameters {
  startingLevel: number
  commandBlock: ExportCommandsShape
}

function calculateEndingLevel({
  startingLevel,
  commandBlock,
}: CalculateEndingLevelParameters) {
  let endingLevel = 0
  if (commandBlock.commands && commandBlock.commands.length > 0) {
    const finalCommand = commandBlock.commands[commandBlock.commands.length - 1]
    endingLevel = typeof finalCommand === 'string' ? 0 : finalCommand.level || 0
  }
  const endingLevelAdjustment = commandBlock.endingLevelAdjustment || 0
  const result = startingLevel + endingLevel + endingLevelAdjustment
  return result
}
