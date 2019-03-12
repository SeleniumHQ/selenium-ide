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

import { preprocessParameter } from './preprocessor'
import StringEscape from 'js-string-escape'

export function emitCommand(command, emitter, variableLookup) {
  if (emitter) {
    return emitter(
      preprocessParameter(
        command.target,
        emitter.targetPreprocessor,
        variableLookup
      ),
      preprocessParameter(
        command.value,
        emitter.valuePreprocessor,
        variableLookup
      )
    )
  }
}

export function emitLocation(location, emitters) {
  if (/^\/\//.test(location)) {
    return emitters.xpath(location)
  }
  const fragments = location.split('=')
  const type = fragments.shift()
  const selector = emitEscapedText(fragments.join('='))
  if (emitters[type]) {
    return emitters[type](selector)
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty")
  }
}

export function emitSelection(location, emitters) {
  if (!location) throw new Error(`Location can't be empty`)
  const [type, selector] = location.split('=')
  if (emitters[type] && selector) {
    let result = emitters[type](selector)
    return result
  } else if (!selector) {
    // no selector strategy given, assuming label
    return emitters['label'](type)
  } else {
    throw new Error(`Unknown selection locator ${type}`)
  }
}

export function emitEscapedText(text) {
  return StringEscape(text)
}

export default {
  command: {
    emit: emitCommand,
  },
  location: {
    emit: emitLocation,
  },
  selection: {
    emit: emitSelection,
  },
  text: {
    emit: emitEscapedText,
  },
}
