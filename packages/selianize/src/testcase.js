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

import CommandEmitter from './command'
import config from './config'

const hooks = []

export function emit(test, options = config, snapshot) {
  return new Promise(async (res, rej) => {
    // eslint-disable-line no-unused-vars
    const hookResults = await Promise.all(hooks.map(hook => hook(test)))
    const setupHooks = hookResults
      .map(hook => hook.setup || '')
      .filter(hook => !!hook)
    const teardownHooks = hookResults
      .map(hook => hook.teardown || '')
      .filter(hook => !!hook)

    let errors = []

    const commands = await Promise.all(
      test.commands.map((command, index) =>
        CommandEmitter.emit(
          command,
          options,
          snapshot ? snapshot.commands[command.id] : undefined
        ).catch(e => {
          if (options.silenceErrors) {
            return `throw new Error("${e.message}");`
          } else {
            errors.push({
              index: index + 1,
              ...command,
              message: e,
            })
          }
        })
      )
    )

    if (errors.length) {
      rej({ ...test, commands: errors })
    }

    if (!options.skipStdLibEmitting) {
      // emit everything
      let emittedTest = `it("${test.name}", async () => {`
      emittedTest += setupHooks
        .join('')
        .concat(snapshot ? snapshot.setupHooks.join('') : '')
      emittedTest += `await tests["${test.name}"](driver, vars);`
      emittedTest += 'expect(true).toBeTruthy();'
      emittedTest += teardownHooks
        .join('')
        .concat(snapshot ? snapshot.teardownHooks.join('') : '')
      emittedTest += '});'

      let func = `tests["${test.name}"] = async (driver, vars, opts = {}) => {`
      func += commands.join('')
      func += '}'

      res({ id: test.id, name: test.name, test: emittedTest, function: func })
    } else {
      // emit only additional hooks
      let snapshot = {
        commands: commands.reduce((snapshot, emittedCommand, index) => {
          if (!emittedCommand.skipped) {
            snapshot[test.commands[index].id] = emittedCommand
          }
          return snapshot
        }, {}),
        setupHooks,
        teardownHooks,
      }

      if (
        Object.keys(snapshot.commands).length ||
        snapshot.setupHooks.length ||
        snapshot.teardownHooks.length
      ) {
        // if we even snapshotted anything
        res({ id: test.id, snapshot })
      } else {
        // resolve to nothing if there is no snapshot
        res({})
      }
    }
  })
}

export function registerHook(hook) {
  hooks.push(hook)
}

export function clearHooks() {
  hooks.length = 0
}

export default {
  emit,
  registerHook,
  clearHooks,
}
