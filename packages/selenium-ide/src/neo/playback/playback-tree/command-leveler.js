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

import { ControlFlowCommandNames } from '../../models/Command'

export function deriveCommandLevels(commandStack) {
  let level = 0
  let levels = []
  commandStack.forEach(function(command) {
    if (levelCommand[command.command]) {
      let result = levelCommand[command.command](command, level, levels)
      level = result.level
      levels = result.levels
    } else {
      let result = levelDefault(command, level, levels)
      levels = result.levels
    }
  })
  return levels
}

let levelCommand = {
  [ControlFlowCommandNames.do]: levelBranchOpen,
  [ControlFlowCommandNames.else]: levelElse,
  [ControlFlowCommandNames.elseIf]: levelElse,
  [ControlFlowCommandNames.end]: levelBranchEnd,
  [ControlFlowCommandNames.forEach]: levelBranchOpen,
  [ControlFlowCommandNames.if]: levelBranchOpen,
  [ControlFlowCommandNames.repeatIf]: levelBranchEnd,
  [ControlFlowCommandNames.times]: levelBranchOpen,
  [ControlFlowCommandNames.while]: levelBranchOpen,
}

function levelDefault(_command, level, _levels) {
  let levels = [..._levels]
  levels.push(level)
  return { level, levels }
}

function levelBranchOpen(_command, level, _levels) {
  let levels = [..._levels]
  levels.push(level)
  level++
  return { level, levels }
}

function levelBranchEnd(_command, level, _levels) {
  let levels = [..._levels]
  level--
  levels.push(level)
  return { level, levels }
}

function levelElse(_command, level, _levels) {
  let levels = [..._levels]
  level--
  levels.push(level)
  level++
  return { level, levels }
}
