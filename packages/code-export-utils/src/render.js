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
  { startingLevel, newLineCount, fullPayload } = {}
) {
  if (!startingLevel) startingLevel = 0
  if (!newLineCount) newLineCount = 1
  if (!fullPayload) fullPayload = false
  if (Array.isArray(input)) {
    return renderCommands(input, { startingLevel, commandPrefixPadding })
  } else {
    const result = prettify(input, {
      commandPrefixPadding,
      startingLevel,
    })
    if (fullPayload) return result
    return result.body.trim().length
      ? result.body + '\n'.repeat(newLineCount)
      : ''
  }
}

function renderCommands(
  commands,
  { startingLevel, commandPrefixPadding } = {}
) {
  let result = ''
  let endingLevel = startingLevel
  commands.forEach(command => {
    const commandBlock = render(commandPrefixPadding, command, {
      startingLevel: endingLevel,
      fullPayload: true,
    })
    endingLevel = commandBlock.endingLevel
    result += commandBlock.body
    result += '\n'
  })
  return result
}
