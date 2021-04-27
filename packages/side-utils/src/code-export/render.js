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

import prettify from './prettify'

export default function render(
  commandPrefixPadding,
  input,
  {
    startingLevel = 0,
    newLineCount = 1,
    fullPayload = false,
    originTracing,
    enableOriginTracing,
  } = {}
) {
  if (Array.isArray(input)) {
    // e.g., an array of emitted command strings to be stitched together
    return renderCommands(input, {
      startingLevel,
      commandPrefixPadding,
      originTracing,
      enableOriginTracing,
    })
  } else {
    const result = prettify(input, {
      commandPrefixPadding,
      startingLevel,
    })
    if (fullPayload) return result
    return result.body && result.body.length
      ? result.body + '\n'.repeat(newLineCount)
      : ''
  }
}

export function renderCommands(
  commands,
  {
    startingLevel,
    commandPrefixPadding,
    originTracing,
    enableOriginTracing,
  } = {}
) {
  let result = ''
  let endingLevel = startingLevel

  if (enableOriginTracing) {
    const originTitle = originTracing.splice(0, 2)
    result += render(commandPrefixPadding, originTitle.join('\n'), {
      startingLevel: endingLevel,
    })
  }
  commands.forEach((command, index) => {
    if (command) {
      if (originTracing && originTracing[index]) {
        let rows = originTracing[index].split('\n')
        rows.forEach(row => {
          let originRecord = render(commandPrefixPadding, row, {
            startingLevel: endingLevel,
          })
          result += originRecord
        })
      }
      const commandBlock = render(commandPrefixPadding, command, {
        startingLevel: endingLevel,
        fullPayload: true,
        enableOriginTracing: enableOriginTracing,
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
