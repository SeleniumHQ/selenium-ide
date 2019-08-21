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

import prettify from '../../../src/code-export/prettify'

describe('Prettify', () => {
  const commandPrefixPadding = '  '
  it('should render from a command array', () => {
    const commandBlock = {
      commands: [
        { level: 0, statement: 'blah' },
        { level: 1, statement: 'blah' },
      ],
    }
    expect(prettify(commandBlock, { commandPrefixPadding }).body).toBe(
      `blah\n  blah`
    )
  })
  it('should render from a command string', () => {
    const commandString = 'blah\nblah'
    expect(prettify(commandString, { commandPrefixPadding }).body).toBe(
      `blah\nblah`
    )
  })
  it('command string can render from a starting level', () => {
    const commandString = 'blah\nblah'
    expect(
      prettify(commandString, {
        commandPrefixPadding,
        startingLevel: 1,
      }).body
    ).toBe(`${commandPrefixPadding}blah\n${commandPrefixPadding}blah`)
  })
  it('command array can render from a starting level', () => {
    const commandBlock = {
      commands: [
        { level: 0, statement: 'blah' },
        { level: 0, statement: 'blah' },
      ],
    }
    const startingLevel = 1
    expect(
      prettify(commandBlock, { commandPrefixPadding, startingLevel }).body
    ).toBe(`${commandPrefixPadding}blah\n${commandPrefixPadding}blah`)
  })
  it('command array can render nested commands from a non-zero starting level', () => {
    const commandBlock = {
      commands: [
        { level: 0, statement: 'if {' },
        { level: 1, statement: 'blah' },
        { level: 0, statement: '}' },
      ],
    }
    const startingLevel = 1
    expect(
      prettify(commandBlock, { commandPrefixPadding, startingLevel }).body
    ).toBe(
      `${commandPrefixPadding}if {\n${commandPrefixPadding}${commandPrefixPadding}blah\n${commandPrefixPadding}}`
    )
  })
  it('command string returns an ending level', () => {
    const commandString = 'blah\nblah'
    const result = prettify(commandString, { commandPrefixPadding })
    expect(result.endingLevel).toBe(0)
  })
  it('command array returns an absolute ending level', () => {
    const commandBlock = {
      commands: [
        { level: 0, statement: 'blah' },
        { level: 1, statement: 'blah' },
      ],
    }
    const startingLevel = 4
    const result = prettify(commandBlock, {
      commandPrefixPadding,
      startingLevel,
    })
    expect(result.endingLevel).toBe(5)
  })
  it('command array can specify an adjustment to the ending level', () => {
    const commandBlock = {
      commands: [
        { level: 0, statement: 'blah' },
        { level: 1, statement: 'blah' },
      ],
      endingLevelAdjustment: +1,
    }
    const result = prettify(commandBlock, { commandPrefixPadding })
    expect(result.endingLevel).toBe(2)
  })
  it('command array can specify an adjustment to the starting level', () => {
    const commandBlock = {
      commands: [
        { level: 0, statement: 'blah' },
        { level: 1, statement: 'blah' },
      ],
      startingLevelAdjustment: -1,
    }
    const startingLevel = 1
    const result = prettify(commandBlock, {
      commandPrefixPadding,
      startingLevel,
    })
    expect(result.body).toBe(`blah\n${commandPrefixPadding}blah`)
    expect(result.endingLevel).toBe(1)
  })
  it('individual command emitting can be skipped', () => {
    const commandBlock = {
      commands: [{ level: 0, statement: '' }],
      skipEmitting: true,
      endingLevelAdjustment: -1,
    }
    const result = prettify(commandBlock, {
      commandPrefixPadding,
      startingLevel: 1,
    })
    expect(result.body).toBeFalsy()
    expect(result.endingLevel).toBe(0)
  })
})
