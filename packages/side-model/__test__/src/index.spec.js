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

import {
  Commands as indexCommands,
  TargetTypes as indexTargetTypes,
  ArgTypes as indexArgTypes,
} from '../../src/index'
import { Commands, TargetTypes } from '../../src/command/Commands'
import { ArgTypes } from '../../src/command/ArgTypes'

describe('side-model/index', () => {
  it('exports the correct thing', () => {
    expect(indexCommands).toBe(Commands)
    expect(indexTargetTypes).toBe(TargetTypes)
    expect(indexArgTypes).toBe(ArgTypes)
  })
})
