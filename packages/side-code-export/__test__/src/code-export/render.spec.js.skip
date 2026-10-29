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

import render from '../../../src/code-export/render'
import { renderCommands } from '../../../src/code-export/render'
import { emitOriginTracing } from '../../../src/code-export/emit'
import TestCase from '../../../../selenium-ide/src/neo/models/TestCase'

describe('Render', () => {
  const commandPrefixPadding = '  '
  const commentPrefix = '//'

  it('should render with command tracing', () => {
    const test = new TestCase()
    test.createCommand(undefined, 'a')
    test.createCommand(undefined, 'b', undefined, undefined, 'comment')
    const commandStatements = ['blah', 'andblah']
    let originTracing = emitOriginTracing(test, { commentPrefix }, true, false)
    let result = renderCommands(commandStatements, {
      startingLevel: 1,
      commandPrefixPadding,
      originTracing,
      enableOriginTracing: true,
    })
    expect(result).toMatch(
      `${commandPrefixPadding}${commentPrefix} Test name: Untitled Test\n${commandPrefixPadding}${commentPrefix} Step # | name | target | value | comment\n${commandPrefixPadding}${commentPrefix} 1 | a |  |  | \n${commandPrefixPadding}blah\n${commandPrefixPadding}${commentPrefix} 2 | b |  |  | comment\n${commandPrefixPadding}andblah`
    )
    originTracing = emitOriginTracing(test, { commentPrefix }, true, true)
    result = renderCommands(commandStatements, {
      startingLevel: 1,
      commandPrefixPadding,
      originTracing,
      enableOriginTracing: true,
    })
    expect(result).toMatch(
      `${commandPrefixPadding}${commentPrefix} Test name: Untitled Test\n${commandPrefixPadding}${commentPrefix} Step # | name | target | value\n${commandPrefixPadding}${commentPrefix} 1 | a |  | \n${commandPrefixPadding}blah\n${commandPrefixPadding}${commentPrefix} 2 | b |  | \n${commandPrefixPadding}${commentPrefix} comment\n${commandPrefixPadding}andblah`
    )
    originTracing = emitOriginTracing(test, { commentPrefix }, false, true)
    result = renderCommands(commandStatements, {
      startingLevel: 1,
      commandPrefixPadding,
      originTracing,
      enableOriginTracing: false,
    })
    expect(result).toMatch(
      `${commandPrefixPadding}blah\n${commandPrefixPadding}${commentPrefix} comment\n${commandPrefixPadding}andblah`
    )
    originTracing = emitOriginTracing(test, { commentPrefix }, false, false)
    result = renderCommands(commandStatements, {
      startingLevel: 1,
      commandPrefixPadding,
      originTracing,
      enableOriginTracing: false,
    })
    expect(result).toMatch(
      `${commandPrefixPadding}blah\n${commandPrefixPadding}andblah`
    )
  })
  it('should render without command tracing', () => {
    const commandStatements = ['blah', 'andblah']
    const result = renderCommands(commandStatements, {
      startingLevel: 0,
      commandPrefixPadding,
    })
    expect(result).toMatch(`blah\nandblah`)
  })
  it('should render with empty string', () => {
    const commandPrefixPadding = '  '
    const input = ''
    const result = render(commandPrefixPadding, input, { startingLevel: 1 })
    expect(result).toMatch(commandPrefixPadding)
  })
  //it('should skip emitting', () => {
  //})
})
