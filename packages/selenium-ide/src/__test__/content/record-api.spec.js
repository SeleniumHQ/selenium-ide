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

jest.mock('../../content/closure-polyfill')
jest.mock('../../common/utils')
const recordApi = require('../../content/record-api')
recordApi.record = jest.fn()
import '../../content/record'
import { fireEvent } from 'dom-testing-library'
import { isFirefox } from '../../common/utils'

describe('record-api', () => {
  let recorder
  let element
  const enterKey = { key: 'Enter', keyCode: 13 }

  function render(markup) {
    element = window.document.createElement('div')
    element.id = 'test-target'
    element.innerHTML = markup
    window.document.body.appendChild(element)
  }

  function filter(source, matcher) {
    return source.find(function(target) {
      return target[0].match(matcher)
    })
  }

  beforeAll(() => {
    recorder = new recordApi.Recorder(window)
  })

  afterEach(() => {
    if (recorder && recorder.attached) {
      recorder.detach()
    }
  })

  describe('setup', () => {
    it('window exists', () => {
      expect(window).toBeDefined()
    })

    it('window body is empty', () => {
      expect(window.document.body.outerHTML).toEqual('<body></body>')
    })

    it('event handlers exist', () => {
      expect(recordApi.Recorder.eventHandlers).not.toEqual({})
    })

    it('recorder attached with event handlers', async () => {
      await recorder.attach()
      expect(recorder.attached).toBeTruthy()
      expect(recorder.eventListeners).toBeTruthy()
      expect(recordApi.record.mock.calls.length).toEqual(0)
      await recorder.detach()
      expect(recorder.attached).toBeFalsy()
    })
  })

  describe('form', () => {
    let inputElement

    beforeEach(() => {
      isFirefox.mockReturnValue(false)
      jest.spyOn(console, 'error')
      console.error.mockImplementation(() => {}) // eslint-disable-line no-console
      render(`
        <form action="/kaki.html" method="get" id="blah">
            <input type="text" />
            <button>asdfsd</button>
            <button type="submit" style="display:none">sub</button>
        </form>
      `)
      recorder.attach()
      inputElement = window.document.querySelector('form input')
      fireEvent.focus(inputElement)
      fireEvent.input(inputElement, { target: { value: 'blah' } })
    })

    afterEach(() => {
      if (element && element.id && element.id === 'test-target') {
        element.parentElement.removeChild(element)
        element = undefined
      }
      recordApi.record.mockClear()
      console.error.mockRestore() // eslint-disable-line no-console
    })

    it('keydown on input records sendKey ${KEY_ENTER}', () => {
      fireEvent.keyDown(inputElement, enterKey)
      fireEvent.keyUp(inputElement, enterKey)
      expect(recordApi.record.mock.calls[1][0]).toEqual('sendKeys')
      expect(
        filter(recordApi.record.mock.calls[1][1], 'type="submit"')
      ).toBeUndefined()
    })

    it('keydown on input records submit (on Firefox)', () => {
      isFirefox.mockReturnValue(true)
      fireEvent.keyDown(inputElement, enterKey)
      fireEvent.keyUp(inputElement, enterKey)
      expect(recordApi.record.mock.calls[1][0]).toEqual('submit')
    })

    it('click on button without type=submit records click', () => {
      const button = window.document.querySelector('button')
      fireEvent.click(button)
      expect(recordApi.record.mock.calls[0][0]).toEqual('click')
    })

    it('click on button with type=submit records click', () => {
      const button = window.document.querySelector("button[type='submit']")
      fireEvent.click(button)
      expect(recordApi.record.mock.calls[0][0]).toEqual('click')
    })
  })
})
