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

import parser from 'ua-parser-js'

export const isTest = process.env.NODE_ENV === 'test'

export const userAgent = parser(window.navigator.userAgent)

export function isChrome() {
  userAgent.browser.name === 'Chrome'
}

export function isFirefox() {
  userAgent.browser.name === 'Firefox'
}

/**
 * Parses a Selenium locator, returning its type and the unprefixed locator
 * string as an object.
 *
 * @param locator  the locator to parse
 */
export function parse_locator(locator) {
  if (!locator) {
    throw new TypeError('Locator cannot be empty')
  }
  const result = locator.match(/^([A-Za-z]+)=.+/)
  if (result) {
    let type = result[1]
    const length = type.length
    const actualLocator = locator.substring(length + 1)
    return { type: type, string: actualLocator }
  }
  throw new Error(
    'Implicit locators are obsolete, please prepend the strategy (e.g. id=element).'
  )
}

/**
 * Returns the tag name of an element lowercased.
 *
 * @param element  an HTMLElement
 */
export function getTagName(element) {
  let tagName
  if (element && element.tagName && element.tagName.toLowerCase) {
    tagName = element.tagName.toLowerCase()
  }
  return tagName
}
