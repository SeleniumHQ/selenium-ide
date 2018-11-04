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

import React from 'react'
import { renderIntoDocument, cleanup } from 'react-testing-library'
import CommandReference from '../../../components/CommandReference'

describe('<CommandReference />', () => {
  afterEach(cleanup)
  it('should render a name', () => {
    const { container } = renderIntoDocument(
      <CommandReference currentCommand={{ name: 'name' }} />
    )
    const commandName = container.querySelector('.signature')
    expect(commandName).toHaveTextContent('name ')
  })
  it('should render a helpful message when no (or uknown) name provided', () => {
    const { container } = renderIntoDocument(
      <CommandReference currentCommand={{}} />
    )
    const commandName = container.querySelector('.unknown-command')
    expect(commandName).toHaveTextContent('Unknown command name provided.')
  })
  it('should render a name with a target', () => {
    const { container } = renderIntoDocument(
      <CommandReference
        currentCommand={{ name: 'name', target: { name: 'target' } }}
      />
    )
    const commandName = container.querySelector('.signature')
    expect(commandName).toHaveTextContent('name target')
  })
  it('should render a name with a target and a value', () => {
    const { container } = renderIntoDocument(
      <CommandReference
        currentCommand={{
          name: 'name',
          target: { name: 'target' },
          value: { name: 'value' },
        }}
      />
    )
    const commandName = container.querySelector('.signature')
    expect(commandName).toHaveTextContent('name target, value')
  })
  it('should render a description', () => {
    const { container } = renderIntoDocument(
      <CommandReference
        currentCommand={{ name: 'name', description: 'description' }}
      />
    )
    const commandDescription = container.querySelector('.description')
    expect(commandDescription).toHaveTextContent('description')
  })
  it('should not render a description unless a name is provided', () => {
    const { container } = renderIntoDocument(
      <CommandReference currentCommand={{ description: 'description' }} />
    )
    const commandDescription = container.querySelector('.description')
    expect(commandDescription).toBeNull()
  })
  it('should render a target argument', () => {
    const { container } = renderIntoDocument(
      <CommandReference
        currentCommand={{
          name: 'name',
          target: { name: 'target name', description: 'target value' },
        }}
      />
    )
    const commandArgument = container.querySelector('.argument')
    expect(commandArgument).toHaveTextContent('target name - target value')
  })
  it('should render an value argument', () => {
    const { container } = renderIntoDocument(
      <CommandReference
        currentCommand={{
          name: 'name',
          value: { name: 'value name', description: 'value value' },
        }}
      />
    )
    const commandArgument = container.querySelector('.argument')
    expect(commandArgument).toHaveTextContent('value name - value value')
  })
  it("should not render an argument if one isn't provided", () => {
    const { container } = renderIntoDocument(
      <CommandReference currentCommand={{ name: 'name' }} />
    )
    const commandArgument = container.querySelector('.argument')
    expect(commandArgument).toBeNull()
  })
  it('should not render an argument if it is empty', () => {
    const { container } = renderIntoDocument(
      <CommandReference
        currentCommand={{ name: 'name', value: { name: '', description: '' } }}
      />
    )
    const commandArgument = container.querySelector('.argument')
    expect(commandArgument).toBeNull()
  })
})
