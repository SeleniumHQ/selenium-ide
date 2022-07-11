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

import { ControlFlowCommandNames } from './commands'
import { CommandShape } from '@seleniumhq/side-model'

export function deriveCommandLevels(commandStack: CommandShape[]): number[] {
  let level = 0
  let levels: number[] = []
  commandStack.forEach(function (command) {
    const result = levelCommand(command, level, levels)
    level = result.level
    levels = result.levels
  })
  return levels
}

export type LevelCommand = (
  command: CommandShape,
  level: number,
  levels: number[]
) => {
  level: number
  levels: number[]
}

const levelDefault: LevelCommand = (_command, level, _levels) => {
  let levels = [..._levels]
  levels.push(level)
  return { level, levels }
}

const levelBranchOpen: LevelCommand = (_command, level, _levels) => {
  let levels = [..._levels]
  levels.push(level)
  level++
  return { level, levels }
}

const levelBranchEnd: LevelCommand = (_command, level, _levels) => {
  let levels = [..._levels]
  level--
  levels.push(level)
  return { level, levels }
}

const levelElse: LevelCommand = (_command, level, _levels) => {
  let levels = [..._levels]
  level--
  levels.push(level)
  level++
  return { level, levels }
}

const levelCommand: LevelCommand = (command, level, levels) => {
  if (!command.skip && commandLevelers[command.command]) {
    return commandLevelers[command.command](command, level, levels)
  }
  return levelDefault(command, level, levels)
}

const commandLevelers = {
  [ControlFlowCommandNames.do]: levelBranchOpen,
  [ControlFlowCommandNames.else]: levelElse,
  [ControlFlowCommandNames.elseIf]: levelElse,
  [ControlFlowCommandNames.end]: levelBranchEnd,
  [ControlFlowCommandNames.forEach]: levelBranchOpen,
  [ControlFlowCommandNames.if]: levelBranchOpen,
  [ControlFlowCommandNames.repeatIf]: levelBranchEnd,
  [ControlFlowCommandNames.times]: levelBranchOpen,
  [ControlFlowCommandNames.try]: levelBranchOpen,
  [ControlFlowCommandNames.while]: levelBranchOpen,
}
