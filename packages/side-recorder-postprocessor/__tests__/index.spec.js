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

import RecordPostprocessor from '../src'

describe('recorder postprocessor', () => {
  describe('recording', () => {
    it('should add commands to an empty test', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'open', target: 'https://google.com/' })
      prc.record(1, {
        command: 'click',
        target: [['linkText=hey', 'linkText']],
        value: '',
      })
      expect(prc.commands.length).toBe(2)
      expect(prc.commands).toMatchSnapshot()
    })
    it('should remove the baseUrl from the `open` target when possible', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'open', target: 'https://google.com/' })
      prc.record(1, { command: 'open', target: 'https://google.co.il/' })
      expect(prc.commands[0].target).toBe('/')
      expect(prc.commands[1].target).toBe('https://google.co.il/')
    })
    it('should add target fallback if possible', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'click', target: 'css=button', value: '' })
      prc.record(1, {
        command: 'click',
        target: [['css=button', 'css']],
        value: '',
      })
      expect(prc.commands[0].targetFallback).not.toBeDefined()
      expect(prc.commands[1].targetFallback).toBeDefined()
      expect(prc.commands).toMatchSnapshot()
    })
    it('should add value fallback if possible', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, {
        command: 'dragAndDropToObject',
        target: 'css=button',
        value: 'css=button',
      })
      prc.record(1, {
        command: 'dragAndDropToObject',
        target: 'css=button',
        value: [['css=button', 'css']],
      })
      expect(prc.commands[0].valueFallback).not.toBeDefined()
      expect(prc.commands[1].valueFallback).toBeDefined()
      expect(prc.commands).toMatchSnapshot()
    })
    it('should remove `click` and `click at` if `double click` or `double click at` was recorded on the same element', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'click', target: 'css=button', value: '' })
      prc.record(1, { command: 'clickAt', target: 'css=button', value: '' })
      expect(prc.commands.length).toBe(2)
      prc.record(2, { command: 'doubleClick', target: 'css=button', value: '' })
      expect(prc.commands.length).toBe(1)
      expect(prc.commands[0].command).toBe('doubleClick')

      prc.record(1, { command: 'click', target: 'css=button', value: '' })
      prc.record(2, { command: 'clickAt', target: 'css=button', value: '' })
      expect(prc.commands.length).toBe(3)
      prc.record(3, {
        command: 'doubleClickAt',
        target: 'css=button',
        value: '',
      })
      expect(prc.commands.length).toBe(2)
      expect(prc.commands[1].command).toBe('doubleClickAt')

      prc.record(2, { command: 'click', target: 'css=button', value: '' })
      expect(prc.commands[2].command).toBe('click')
    })
    it('should not add `store window handle` for `select window` if the root handle is stored', () => {
      const prc = new RecordPostprocessor('https://google.com', [
        {
          command: 'storeWindowHandle',
          target: 'root',
          value: '',
        },
      ])
      prc.record(1, { command: 'selectWindow', target: 'handle=${root}' })
      expect(prc.commands.length).toBe(2)
      expect(prc.commands).toMatchSnapshot()
    })
    it('should add `store window handle` to be able to switch back to the root window', () => {
      const prc = new RecordPostprocessor('https://google.com', [
        {
          command: 'selectWindow',
          target: 'handle=${newWindow}',
          value: '',
        },
      ])
      prc.record(1, { command: 'selectWindow', target: 'handle=${root}' })
      expect(prc.commands.length).toBe(3)
      expect(prc.commands[0].command).toBe('storeWindowHandle')
      expect(prc.commands[2].target).toBe('handle=${root}')
      expect(prc.commands).toMatchSnapshot()
    })
  })
  describe('CRUD', () => {
    it('should add a command mid recording', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'click', target: 'css=button' })
      prc.add(1, { command: 'test', target: 'hello' })
      prc.record(2, { command: 'click', target: 'css=button' })
      expect(prc.commands.length).toBe(3)
      expect(prc.commands[1].command).toBe('test')
    })
    it('should remove a recorded command', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'click', target: 'css=button' })
      prc.record(1, { command: 'clickAt', target: 'css=button' })
      expect(prc.commands.length).toBe(2)
      expect(prc.commands[1].command).toBe('clickAt')
      prc.remove(1)
      expect(prc.commands.length).toBe(1)
      expect(prc.commands[0].command).toBe('click')
    })
    it('should replace a recorded command', () => {
      const prc = new RecordPostprocessor('https://google.com')
      prc.record(0, { command: 'click', target: 'css=button' })
      prc.record(1, { command: 'clickAt', target: 'css=button' })
      expect(prc.commands.length).toBe(2)
      prc.replace(1, {
        command: 'test',
      })
      expect(prc.commands.length).toBe(2)
      expect(prc.commands[1].command).toBe('test')
    })
  })
})
