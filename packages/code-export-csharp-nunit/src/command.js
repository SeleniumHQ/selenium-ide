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

import { codeExport as exporter } from '@seleniumhq/side-utils'
import { Command } from '@seleniumhq/code-export-csharp-commons'

exporter.register.preprocessors(Command.emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters: Command.emitters })
}

function emit(command) {
  return exporter.emit.command(command, Command.emitters[command.command], {
    variableLookup: Command.variableLookup,
    emitNewWindowHandling: Command.extras.emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!Command.emitters[commandName]
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow: Command.extras.emitWaitForWindow },
}
