/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { parse_locator, isVisible } from './utils'
import finder from '@medv/finder'

const findElement = require('./third-party/find-element')

type LocatorFunction = (e: HTMLElement, ctx?: any) => string | null

export default class LocatorBuilders {
  constructor(window: Window) {
    this.window = window
  }

  listenForChanges() {
    this.setLocatorsOrderFromState()
    this.window.sideAPI.recorder.onLocatorOrderChanged.addListener(
      LocatorBuilders.setPreferredOrder
    )
  }

  window: Window
  detach() {}
  static order: string[] = []
  static builderMap: Record<string, LocatorFunction> = {}
  static _preferredOrder: string[] = []

  async setLocatorsOrderFromState() {
    const orderedLocators = await this.window.sideAPI.recorder.getLocatorOrder()
    LocatorBuilders.setPreferredOrder(orderedLocators)
  }

  buildWith(name: string, e: HTMLElement, opt_contextNode?: any) {
    return LocatorBuilders.builderMap[name].call(this, e, opt_contextNode)
  }

  elementEquals(_name: string, e: HTMLElement, locator: string) {
    let fe = this.findElement(locator)
    //TODO: add match function to the ui locator builder, note the inverted parameters
    return (
      e == fe
      // || (LocatorBuilders.builderMap[name] &&
      //   LocatorBuilders.builderMap[name].match &&
      //   LocatorBuilders.builderMap[name].match(e, fe))
    )
  }

  build(e: HTMLElement) {
    let locators = this.buildAll(e)
    if (locators.length > 0) {
      return locators[0][0]
    } else {
      return 'LOCATOR_DETECTION_FAILED'
    }
  }

  buildAll(el: HTMLElement): [string, string][] {
    let locator
    let locators: [string, string][] = []

    let root = document.body
    let loopEl: HTMLElement | null = el
    while (loopEl && loopEl != root) {
      if (isVisible(loopEl)) {
        el = loopEl
        break
      } else {
        loopEl = loopEl.parentElement
      }
    }

    for (let i = 0; i < LocatorBuilders.order.length; i++) {
      let finderName = LocatorBuilders.order[i]
      try {
        locator = this.buildWith(finderName, el)
        if (locator) {
          locator = String(locator)
          //Samit: The following is a quickfix for above commented code to stop exceptions on almost every locator builder
          //TODO: the builderName should NOT be used as a strategy name, create a feature to allow locatorBuilders to specify this kind of behaviour
          //TODO: Useful if a builder wants to capture a different element like a parent. Use the this.elementEquals
          let fe = this.findElement(locator)
          if (el == fe) {
            locators.push([locator, finderName])
          }
        }
      } catch (e) {
        // TODO ignore the buggy locator builder for now
        //this.log.debug("locator exception: " + e);
      }
    }
    return locators
  }

  findElement(loc: string) {
    try {
      const locator = parse_locator(loc)
      return findElement(
        { [locator.type]: locator.string },
        this.window.document
      )
    } catch (error) {
      //this.log.debug("findElement failed: " + error + ", locator=" + locator);
      return null
    }
  }
  /*
   * Class methods
   */

  // NOTE: for some reasons we does not use this part
  // classObservable(LocatorBuilders);

  static add(name: string, finder: LocatorFunction) {
    this.order.push(name)
    this.builderMap[name] = finder
    this._orderChanged()
  }

  /**
   * Call when the order or preferred order changes
   */
  static _orderChanged() {
    let changed = this._ensureAllPresent(this.order, this._preferredOrder)
    this._sortByRefOrder(this.order, this._preferredOrder)
    if (changed) {
      // NOTE: for some reasons we does not use this part
      // this.notify('preferredOrderChanged', this._preferredOrder);
    }
  }

  /**
   * Set the preferred order of the locator builders
   *
   * @param preferredOrder can be an array or a comma separated string of names
   */
  static setPreferredOrder(preferredOrder: string | string[]) {
    if (typeof preferredOrder === 'string') {
      this._preferredOrder = preferredOrder.split(',')
    } else {
      this._preferredOrder = preferredOrder
    }
    this._orderChanged()
  }

  /**
   * Returns the locator builders preferred order as an array
   */
  getPreferredOrder() {
    return LocatorBuilders._preferredOrder
  }

  /**
   * Sorts arrayToSort in the order of elements in sortOrderReference
   * @param arrayToSort
   * @param sortOrderReference
   */
  static _sortByRefOrder = function (
    arrayToSort: any[],
    sortOrderReference: any[]
  ) {
    let raLen = sortOrderReference.length
    arrayToSort.sort(function (a, b) {
      let ai = sortOrderReference.indexOf(a)
      let bi = sortOrderReference.indexOf(b)
      return (ai > -1 ? ai : raLen) - (bi > -1 ? bi : raLen)
    })
  }

  /**
   * Function to add to the bottom of destArray elements from source array that do not exist in destArray
   * @param sourceArray
   * @param destArray
   */
  static _ensureAllPresent = function (sourceArray: any[], destArray: any[]) {
    let changed = false
    sourceArray.forEach(function (e) {
      if (destArray.indexOf(e) == -1) {
        destArray.push(e)
        changed = true
      }
    })
    return changed
  }

  /*
   * Utility function: Encode XPath attribute value.
   */
  attributeValue(value: string) {
    if (value.indexOf("'") < 0) {
      return "'" + value + "'"
    } else if (value.indexOf('"') < 0) {
      return '"' + value + '"'
    } else {
      let result = 'concat('
      let part = ''
      let didReachEndOfValue = false
      while (!didReachEndOfValue) {
        let apos = value.indexOf("'")
        let quot = value.indexOf('"')
        if (apos < 0) {
          result += "'" + value + "'"
          didReachEndOfValue = true
          break
        } else if (quot < 0) {
          result += '"' + value + '"'
          didReachEndOfValue = true
          break
        } else if (quot < apos) {
          part = value.substring(0, apos)
          result += "'" + part + "'"
          value = value.substring(part.length)
        } else {
          part = value.substring(0, quot)
          result += '"' + part + '"'
          value = value.substring(part.length)
        }
        result += ','
      }
      result += ')'
      return result
    }
  }

  xpathHtmlElement(name: string) {
    if (this.window.document.contentType == 'application/xhtml+xml') {
      // "x:" prefix is required when testing XHTML pages
      return 'x:' + name
    } else {
      return name
    }
  }

  relativeXPathFromParent(current: HTMLElement) {
    let index = this.getNodeNbr(current)
    let currentPath =
      '/' + this.xpathHtmlElement(current.nodeName.toLowerCase())
    if (index > 0) {
      currentPath += '[' + (index + 1) + ']'
    }
    return currentPath
  }

  getNodeNbr(current: HTMLElement) {
    let childNodes = current?.parentNode?.childNodes ?? []
    let total = 0
    let index = -1
    for (let i = 0; i < childNodes.length; i++) {
      let child = childNodes[i]
      if (child.nodeName == current.nodeName) {
        if (child == current) {
          index = total
        }
        total++
      }
    }
    return index
  }

  preciseXPath(xpath: string, e: HTMLElement) {
    //only create more precise xpath if needed
    if (this.findElement(xpath) != e) {
      let result = e.ownerDocument.evaluate(
        xpath,
        e.ownerDocument,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      )
      //skip first element (result:0 xpath index:1)
      for (let i = 0, len = result.snapshotLength; i < len; i++) {
        let newPath = 'xpath=(' + xpath + ')[' + (i + 1) + ']'
        if (this.findElement(newPath) == e) {
          return newPath
        }
      }
    }
    return 'xpath=' + xpath
  }
}
/*
 * ===== builders =====
 */

// order listed dictates priority
// e.g., 1st listed is top priority

LocatorBuilders.add(
  'css:data-test-id',
  function (this: LocatorBuilders, e: HTMLElement) {
    const dataAttributes = ['data-test-id', 'data-test']
    for (let i = 0; i < dataAttributes.length; i++) {
      const attr = dataAttributes[i]
      const value = e.getAttribute(attr)
      if (value) {
        return `css=[${attr}="${value}"]`
      }
    }
    return null
  }
)

LocatorBuilders.add('id', function (this: LocatorBuilders, e: HTMLElement) {
  if (e.id) {
    return 'id=' + e.id
  }
  return null
})

LocatorBuilders.add(
  'linkText',
  function (this: LocatorBuilders, e: HTMLElement) {
    if (e.nodeName == 'A') {
      let text = e.textContent || ''
      if (!text.match(/^\s*$/)) {
        return (
          'linkText=' +
          text.replace(/\xA0/g, ' ').replace(/^\s*(.*?)\s*$/, '$1')
        )
      }
    }
    return null
  }
)

LocatorBuilders.add('name', function (this: LocatorBuilders, _e: HTMLElement) {
  const e = _e as HTMLInputElement
  if (e.name) {
    return 'name=' + e.name
  }
  return null
})

const dataAttributeFromDatasetProperty = (attr: string) =>
  `data-${attr.replace(
    /[A-Z]/g,
    (letter: string) => `-${letter.toLowerCase()}`
  )}`

LocatorBuilders.add(
  'css:data-attr',
  function (this: LocatorBuilders, e: HTMLElement) {
    const dataKeys = Object.keys(e.dataset || {})
    if (dataKeys.length) {
      const attr = dataKeys[0]
      const value = e.dataset[attr]
      const htmlAttr = dataAttributeFromDatasetProperty(attr)
      if (!value || value === 'true') {
        return `css=[${htmlAttr}]`
      }
      return `css=[${htmlAttr}="${value}"]`
    }
    return null
  }
)

LocatorBuilders.add(
  'css:finder',
  function (this: LocatorBuilders, e: HTMLElement) {
    return 'css=' + finder(e)
  }
)

LocatorBuilders.add(
  'xpath:link',
  function (this: LocatorBuilders, e: HTMLElement) {
    if (e.nodeName == 'A') {
      let text = e.textContent || ''
      if (!text.match(/^\s*$/)) {
        return this.preciseXPath(
          '//' +
            this.xpathHtmlElement('a') +
            "[contains(text(),'" +
            text.replace(/^\s+/, '').replace(/\s+$/, '') +
            "')]",
          e
        )
      }
    }
    return null
  }
)

LocatorBuilders.add('xpath:img', function (this: LocatorBuilders, _e) {
  const e = _e as HTMLImageElement
  if (e.nodeName == 'IMG') {
    if (e.alt != '') {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('img') +
          '[@alt=' +
          this.attributeValue(e.alt) +
          ']',
        e
      )
    } else if (e.title != '') {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('img') +
          '[@title=' +
          this.attributeValue(e.title) +
          ']',
        e
      )
    } else if (e.src != '') {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('img') +
          '[contains(@src,' +
          this.attributeValue(e.src) +
          ')]',
        e
      )
    }
  }
  return null
})

LocatorBuilders.add('xpath:attributes', function (this: LocatorBuilders, e) {
  const PREFERRED_ATTRIBUTES = [
    'id',
    'name',
    'value',
    'type',
    'action',
    'onclick',
  ]
  let i = 0

  const attributesXPath = (
    name: string,
    attNames: string[],
    attributes: Record<string, string>
  ) => {
    let locator = '//' + this.xpathHtmlElement(name) + '['
    for (i = 0; i < attNames.length; i++) {
      if (i > 0) {
        locator += ' and '
      }
      let attName = attNames[i]
      locator += '@' + attName + '=' + this.attributeValue(attributes[attName])
      if (e.textContent && attName == 'type') {
        locator += ' and text()=' + this.attributeValue(e.textContent)
      }
    }
    locator += ']'
    return this.preciseXPath(locator, e)
  }

  if (e.attributes) {
    let atts = e.attributes
    let attsMap: Record<string, string> = {}
    for (i = 0; i < atts.length; i++) {
      let att = atts[i]
      attsMap[att.name] = att.value
    }
    let names = []
    // try preferred attributes
    for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
      let name = PREFERRED_ATTRIBUTES[i]
      if (attsMap[name] != null) {
        names.push(name)
        let locator = attributesXPath(e.nodeName.toLowerCase(), names, attsMap)
        if (e == this.findElement(locator)) {
          return locator
        }
      }
    }
  }
  return null
})

LocatorBuilders.add('xpath:idRelative', function (this: LocatorBuilders, e) {
  let path = ''
  let current = e
  while (current != null) {
    if (current.parentNode != null) {
      path = this.relativeXPathFromParent(current) + path
      const parentNode = current.parentNode as HTMLElement
      if (
        1 == parentNode.nodeType && // ELEMENT_NODE
        parentNode.getAttribute('id')
      ) {
        return this.preciseXPath(
          '//' +
            this.xpathHtmlElement(parentNode.nodeName.toLowerCase()) +
            '[@id=' +
            this.attributeValue(parentNode.getAttribute('id') as string) +
            ']' +
            path,
          e
        )
      }
    } else {
      return null
    }
    current = current.parentNode as HTMLElement
  }
  return null
})

LocatorBuilders.add('xpath:href', function (this: LocatorBuilders, e) {
  if (e.attributes && e.hasAttribute('href')) {
    let href = e.getAttribute('href') as string
    if (href.search(/^http?:\/\//) >= 0) {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('a') +
          '[@href=' +
          this.attributeValue(href) +
          ']',
        e
      )
    } else {
      // use contains(), because in IE getAttribute("href") will return absolute path
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('a') +
          '[contains(@href, ' +
          this.attributeValue(href) +
          ')]',
        e
      )
    }
  }
  return null
})

LocatorBuilders.add(
  'xpath:position',
  function (this: LocatorBuilders, e, opt_contextNode) {
    let path = ''
    let current = e
    while (current != null && current != opt_contextNode) {
      let currentPath
      if (current.parentNode != null) {
        currentPath = this.relativeXPathFromParent(current)
      } else {
        currentPath =
          '/' + this.xpathHtmlElement(current.nodeName.toLowerCase())
      }
      path = currentPath + path
      let locator = '/' + path
      if (e == this.findElement(locator)) {
        return 'xpath=' + locator
      }
      current = current.parentNode as HTMLElement
    }
    return null
  }
)

LocatorBuilders.add('xpath:innerText', function (this: LocatorBuilders, el) {
  if (el.innerText) {
    return `xpath=//${el.nodeName.toLowerCase()}[contains(.,'${el.innerText}')]`
  } else {
    return null
  }
})

export const singleton = new LocatorBuilders(window)
