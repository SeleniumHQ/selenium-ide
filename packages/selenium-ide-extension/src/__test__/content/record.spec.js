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
jest.mock('../../content/record-api')
jest.mock('../../common/utils')
import { _isValidForm, _recordFormAction, record } from '../../content/record'
import { isFirefox } from '../../common/utils'

function createTargetWithAttribute(attribute) {
  return {
    hasAttribute: function(attribute) {
      return this.hasOwnProperty(attribute)
    },
    ...attribute,
  }
}

describe('record', () => {
  it('isValidForm', () => {
    isFirefox.mockReturnValue(false)
    expect(
      _isValidForm('form', createTargetWithAttribute({ id: true }))
    ).toBeFalsy()
    expect(
      _isValidForm('form', createTargetWithAttribute({ name: true }))
    ).toBeFalsy()
    expect(
      _isValidForm('form', createTargetWithAttribute({ onsubmit: true }))
    ).toBeFalsy()
    expect(
      _isValidForm('notaform', createTargetWithAttribute({ id: true }))
    ).toBeFalsy()
    expect(
      _isValidForm('form', createTargetWithAttribute({ css: true }))
    ).toBeFalsy()
    isFirefox.mockReturnValue(true)
    expect(
      _isValidForm('form', createTargetWithAttribute({ id: true }))
    ).toBeTruthy()
    expect(
      _isValidForm('form', createTargetWithAttribute({ name: true }))
    ).toBeTruthy()
    expect(
      _isValidForm('form', createTargetWithAttribute({ onsubmit: true }))
    ).toBeFalsy()
    expect(
      _isValidForm('notaform', createTargetWithAttribute({ id: true }))
    ).toBeFalsy()
    expect(
      _isValidForm('form', createTargetWithAttribute({ css: true }))
    ).toBeFalsy()
  })

  describe('recordFormAction', () => {
    afterEach(() => {
      record.mockReset()
    })
    it('submit id', () => {
      _recordFormAction(createTargetWithAttribute({ id: 'formId' }))
      expect(record.mock.calls[0][0]).toBe('submit')
      expect(record.mock.calls[0][1][0][0]).toBe('id=formId')
      expect(record.mock.calls[0][1][0][1]).toBe('id')
    })
    it('submit name', () => {
      _recordFormAction(createTargetWithAttribute({ name: 'formName' }))
      expect(record.mock.calls[0][0]).toBe('submit')
      expect(record.mock.calls[0][1][0][0]).toBe('name=formName')
      expect(record.mock.calls[0][1][0][1]).toBe('name')
    })
    it('submit css', () => {
      _recordFormAction(createTargetWithAttribute({ css: 'formCss' }))
      expect(record.mock.calls).toEqual([])
    })
  })
})
