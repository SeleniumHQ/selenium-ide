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

export const isTest = process.env.NODE_ENV === 'test'

/**
 * Parses a Selenium locator, returning its type and the unprefixed locator
 * string as an object.
 *
 * @param locator  the locator to parse
 */
export function parse_locator(locator: string) {
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
export function getTagName(element: HTMLElement) {
  let tagName
  if (element && element.tagName && element.tagName.toLowerCase) {
    tagName = element.tagName.toLowerCase()
  }
  return tagName
}


/**
 * Return element is visible
 *
 * https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
 * 
 * @param element  an HTMLElement
 */
export function isVisible(elem: HTMLElement) {
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (parseFloat(style.opacity) < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer: any = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while ((pointContainer = pointContainer!.parentNode));
    return false;
}