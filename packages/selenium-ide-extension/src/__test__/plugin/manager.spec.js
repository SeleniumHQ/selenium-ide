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

import Manager from '../../plugin/manager'
import { ArgTypes } from '../../../src/neo/models/Command'
import { canExecuteCommand } from '../../plugin/commandExecutor'

describe('plugin manager', () => {
  it('should have a list of active plugins', () => {
    expect(Manager.plugins).toBeDefined()
  })
  it('should register a plugin', () => {
    const plugin = {
      id: '1',
      name: 'an extension from the store',
      version: '1.0.0',
      commands: [
        {
          id: 'aCommand',
          name: 'do something',
          docs: {
            description: 'command description',
            target: {
              name: 'command target',
              description: 'command target description',
            },
            value: {
              name: 'command value',
              description: 'command value description',
            },
          },
        },
        {
          id: 'anotherCommand',
          name: 'do something else',
          docs: {
            description: 'command description',
            target: 'locator',
            value: 'script',
          },
        },
      ],
    }
    expect(Manager.plugins.length).toBe(0)
    Manager.registerPlugin(plugin)
    expect(Manager.plugins.length).toBe(1)
    expect(canExecuteCommand(plugin.commands[0].id)).toBeTruthy()
  })
  it('should register a plugin with no commands', () => {
    const plugin = {
      id: 'nocommands',
      name: 'no commands here',
      version: '1.0.0',
    }
    const currLength = Manager.plugins.length
    Manager.registerPlugin(plugin)
    expect(Manager.plugins.length).toBe(currLength + 1)
  })
  it('should tell if a plugin was already registered', () => {
    const plugin = {
      id: '2',
      name: 'an extension from the store',
      version: '1.0.0',
    }
    const anotherPlugin = {
      id: '3',
      name: 'an extension from the store',
      version: '1.0.0',
    }
    expect(Manager.hasPlugin(plugin.id)).toBeFalsy()
    Manager.registerPlugin(anotherPlugin)
    expect(Manager.hasPlugin(anotherPlugin.id)).toBeTruthy()
  })
  it('should throw if a plugin was already registered', () => {
    const plugin = {
      id: '4',
      name: 'dont register me twice',
      version: '1.0.0',
    }
    Manager.registerPlugin(plugin)
    expect(() => {
      Manager.registerPlugin(plugin)
    }).toThrowError('This plugin is already registered')
  })
  it('should get the plugin', () => {
    const plugin = {
      id: '5',
      name: 'try to find me',
      version: '1.0.0',
    }
    Manager.registerPlugin(plugin)
    expect(Manager.getPlugin(plugin.id)).toBe(plugin)
  })
  it('should use existing command ArgTypes if present', () => {
    const docs = {
      description: 'command description',
      target: ArgTypes.locator.name,
      value: ArgTypes.script.name,
    }
    const expectedDocs = {
      description: 'command description',
      target: {
        name: ArgTypes.locator.name,
        description: ArgTypes.locator.description,
      },
      value: {
        name: ArgTypes.script.name,
        description: ArgTypes.script.description,
      },
    }
    expect(Manager.useExistingArgTypesIfProvided(docs)).toEqual(expectedDocs)
  })
})
