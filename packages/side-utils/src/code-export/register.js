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

import { keysPreprocessor, scriptPreprocessor } from './preprocessor'

export function registerCommandEmitter({ command, emitter, emitters } = {}) {
  if (!emitters[command]) {
    emitters[command] = emitter
  } else {
    throw new Error('Unable to overwrite an existing command emitter')
  }
}

export function registerPreprocessors(emitters) {
  Object.keys(emitters).forEach(emitter => {
    switch (emitter) {
      case 'sendKeys':
        emitters[emitter].valuePreprocessor = keysPreprocessor
        break
      case 'runScript':
      case 'executeScript':
      case 'executeAsyncScript':
      case 'if':
      case 'elseIf':
      case 'repeatIf':
      case 'while':
        emitters[emitter].targetPreprocessor = scriptPreprocessor
        break
    }
  })
}

export async function registerMethod(
  name,
  result,
  { generateMethodDeclaration, hooks }
) {
  let methodDeclaration = generateMethodDeclaration(name)
  methodDeclaration =
    typeof methodDeclaration === 'object'
      ? methodDeclaration.body
      : methodDeclaration
  if (!(await hooks.declareMethods.isRegistered(methodDeclaration))) {
    result.forEach(statement => {
      hooks.declareMethods.register(() => {
        return statement
      })
    })
  }
}
