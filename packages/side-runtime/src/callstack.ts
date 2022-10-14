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

import { CommandShape, TestShape } from '@seleniumhq/side-model'
import { PlaybackTree } from './playback-tree'
import { CommandNode } from './playback-tree/command-node'

const stack = Symbol('stack')

export interface Caller {
  position: CommandNode['next']
  tree: PlaybackTree
  commands: CommandShape[]
}

export interface CallShape {
  callee: TestShape
  caller?: Caller
}

export default class Callstack {
  constructor() {
    this[stack] = []
  }
  [stack]: CallShape[]
  get length() {
    return this[stack].length
  }

  call(procedure: CallShape) {
    this[stack].push(procedure)
  }

  unwind(): CallShape {
    if (!this.length) throw new Error('Call stack is empty')
    return this[stack].pop() as CallShape
  }

  top() {
    return this[stack][this[stack].length - 1]
  }
}
