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

import Argument from './argument'

// TODO: replace all this with esprima
const firstVariableCharacterTokenRegex = /[a-z_]/i
const anyVariableCharacterTokenRegex = /[a-z0-9_]/i
const integerCharacterTokenRegex = /[0-9]/

export default new Argument({
  name: 'Variable',
  description: `The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').`,
  identify: (value: string) => typeof value === 'string',
  validate: (value: string) => {
    return parseVariable(value) === value.length
  },
})

function parseVariable(value: string) {
  let position = parseVariableName({
    value,
    position: 0,
    validTerminatingCharacters: ['.', '[', ']'],
  })
  let lastPosition = 0
  let isInArrayMode = false
  while (position < value.length) {
    if (lastPosition === position) {
      throw new SyntaxError(
        `Unable to parse variable ${value} at position ${position} character ${value[position]}`
      )
    }
    lastPosition = position
    const token = value[position]
    if (token === '.') {
      position = parseVariableName({
        value,
        position: position + 1,
        validTerminatingCharacters: ['.'],
      })
    } else if (token === '[') {
      isInArrayMode = true
      if (integerCharacterTokenRegex.test(value[position + 1])) {
        position = parseInteger({
          value,
          position: position + 1,
          validTerminatingCharacters: [']'],
        })
      } else {
        position = parseVariableName({
          value,
          position: position + 1,
          validTerminatingCharacters: ['.', ']'],
        })
      }
    } else if (token === ']') {
      if (isInArrayMode) {
        isInArrayMode = false
        position += 1
      } else {
        throwUnexpectedToken(token)
      }
    }
  }

  if (isInArrayMode) {
    throwMissingToken(']')
  }

  return position
}

function parseVariableName({
  value,
  position,
  validTerminatingCharacters,
}: {
  value: string
  position: number
  validTerminatingCharacters: string[]
}) {
  let firstTokenChecked = false
  while (position < value.length) {
    const token = value[position]

    if (!firstTokenChecked) {
      firstTokenChecked = true
      if (!firstVariableCharacterTokenRegex.test(token)) {
        throwUnexpectedToken(token)
      }
    } else if (validTerminatingCharacters.includes(token)) {
      return position
    } else if (!anyVariableCharacterTokenRegex.test(token)) {
      throwUnexpectedToken(token)
    }
    position += 1
  }
  return position
}

function parseInteger({
  value,
  position,
  validTerminatingCharacters,
}: {
  value: string
  position: number
  validTerminatingCharacters: string[]
}) {
  let arrayIndex = ''
  while (position < value.length) {
    const token = value[position]
    if (arrayIndex === '0' && !validTerminatingCharacters.includes(token)) {
      throwUnexpectedToken(token)
    } else if (validTerminatingCharacters.includes(token)) {
      if (!arrayIndex.length) {
        throwUnexpectedToken(token)
      }
      return position
    } else if (!integerCharacterTokenRegex.test(token)) {
      throwUnexpectedToken(token)
    }
    arrayIndex += token
    position += 1
  }
  return position
}

function throwUnexpectedToken(token: string) {
  throw new SyntaxError(`Unexpected token ${token}`)
}

function throwMissingToken(token: string) {
  throw new SyntaxError(`Missing token ${token}`)
}
