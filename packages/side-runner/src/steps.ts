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

import { CommandShape } from '@seleniumhq/side-model'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'

type CommandState = PlaybackEventShapes['COMMAND_STATE_CHANGED']['state']

// The mark printed for each finished command with --steps
const stepMarks: Partial<Record<CommandState, string>> = {
  errored: '✕',
  failed: '✕',
  passed: '✓',
  skipped: '-',
  undetermined: '○',
}

// The --steps line for a command, or undefined while it is still running
export const formatStep = (
  testName: string,
  command: CommandShape,
  state: CommandState,
  message?: string
): string | undefined => {
  const mark = stepMarks[state]
  if (!mark) return undefined
  const step = [command.command, command.target, command.value]
    .filter((v) => !!v)
    .join(' | ')
  const detail =
    (state === 'failed' || state === 'errored') && message ? `: ${message}` : ''
  return `${mark} ${testName} › ${step}${detail}`
}
