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

/**
 * Returns a prettified string with indentation and line-breaks based on inputs
 * @param {Object|string} commandBlock The input to be prettified
 * @param {Object} opts - The styling options
 * @param {number} opts.startingLevel The staring indentation level
 * @param {string} opts.commandPrefixPadding The padding to use for indentation
 * @returns {Object} The prettified result (e.g., `.body`) and the absolute
 * indentation level (e.g., `endingLevel`) for the next command to use
 */
export default function prettify(
  commandBlock,
  { startingLevel, commandPrefixPadding } = {}
) {
  if (commandBlock === undefined) return { body: undefined }
  if (!startingLevel) startingLevel = 0
  if (commandBlock.startingLevelAdjustment)
    startingLevel += commandBlock.startingLevelAdjustment
  if (startingLevel < 0) startingLevel = 0
  if (typeof commandBlock.commands === 'object') {
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
        body: commandBlock.commands
          .map(
            command =>
              commandPrefixPadding.repeat(startingLevel + command.level) +
              command.statement
          )
          .join('\n'),
        endingLevel: calculateEndingLevel({ startingLevel, commandBlock }),
      }
    }
  } else {
    return {
      body: commandBlock
        .split('\n')
        .join('\n' + commandPrefixPadding.repeat(startingLevel))
        .replace(/^/, commandPrefixPadding.repeat(startingLevel)),
      endingLevel: startingLevel,
    }
  }
}

function calculateEndingLevel({ startingLevel, commandBlock } = {}) {
  let endingLevel = 0
  if (commandBlock.commands && commandBlock.commands.length > 0) {
    endingLevel =
      commandBlock.commands[commandBlock.commands.length - 1].level || 0
  }
  const endingLevelAdjustment = commandBlock.endingLevelAdjustment || 0
  const result = startingLevel + endingLevel + endingLevelAdjustment
  return result
}
