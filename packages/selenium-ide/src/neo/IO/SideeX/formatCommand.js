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

import browser from 'webextension-polyfill'
import { Logger, Channels, output } from '../../stores/view/Logs'
import variables from '../../stores/view/Variables'

const logger = new Logger(Channels.PLAYBACK)
const nbsp = String.fromCharCode(160)

export function xlateArgument(value) {
  value = value.replace(/^\s+/, '')
  value = value.replace(/\s+$/, '')
  let r2
  let parts = []
  if (/\$\{/.exec(value)) {
    const regexp = /\$\{(.*?)\}/g
    let lastIndex = 0
    while ((r2 = regexp.exec(value))) {
      if (variables.get(r2[1])) {
        if (r2.index - lastIndex > 0) {
          parts.push(string(value.substring(lastIndex, r2.index)))
        }
        parts.push(variables.get(r2[1]))
        lastIndex = regexp.lastIndex
      } else if (r2[1] == 'nbsp') {
        if (r2.index - lastIndex > 0) {
          parts.push(
            variables.get(string(value.substring(lastIndex, r2.index)))
          )
        }
        parts.push(nbsp)
        lastIndex = regexp.lastIndex
      }
    }
    if (lastIndex < value.length) {
      parts.push(string(value.substring(lastIndex, value.length)))
    }
    return parts.join('')
  } else {
    return string(value)
  }
}

export function interpolateScript(script) {
  let value = script.replace(/^\s+/, '').replace(/\s+$/, '')
  let r2
  let parts = []
  const variablesUsed = {}
  const argv = []
  let argl = 0 // length of arguments
  if (/\$\{/.exec(value)) {
    const regexp = /\$\{(.*?)\}/g
    let lastIndex = 0
    while ((r2 = regexp.exec(value))) {
      const variableName = r2[1]
      if (variables.has(variableName)) {
        if (r2.index - lastIndex > 0) {
          parts.push(string(value.substring(lastIndex, r2.index)))
        }
        if (!variablesUsed.hasOwnProperty(variableName)) {
          variablesUsed[variableName] = argl
          argv.push(variables.get(variableName))
          argl++
        }
        parts.push(`arguments[${variablesUsed[variableName]}]`)
        lastIndex = regexp.lastIndex
      }
    }
    if (lastIndex < value.length) {
      parts.push(string(value.substring(lastIndex, value.length)))
    }
    return {
      script: parts.join(''),
      argv,
    }
  } else {
    return {
      script: string(value),
      argv,
    }
  }
}

function string(value) {
  if (value != null) {
    value = value.replace(/\\\\/g, '\\')
    value = value.replace(/\\r/g, '\r')
    value = value.replace(/\\n/g, '\n')
    return value
  } else {
    return ''
  }
}

function handleFormatCommand(message, _sender, sendResponse) {
  if (message.getVar) {
    return sendResponse(variables.get(message.variable))
  } else if (message.storeVar) {
    variables.set(message.storeVar, message.storeStr)
    return sendResponse(true)
  } else if (message.echoStr) {
    logger.log('echo: ' + message.echoStr)
    return sendResponse(true)
  } else if (
    message.log &&
    output.logs[output.logs.length - 1].message.indexOf(message.log.message) ===
      -1
  ) {
    // this check may be dangerous, especially if something else is bombarding the logs
    logger[message.log.type || 'log'](message.log.message)
    return sendResponse(true)
  }
}

try {
  browser.runtime.onMessage.addListener(handleFormatCommand)
} catch(e) {} // eslint-disable-line
