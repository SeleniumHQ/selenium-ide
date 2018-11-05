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

// Modified in tools.js from selenium-IDE

export function exactMatchPattern(string) {
  if (
    string != null &&
    (string.match(/^\w*:/) ||
      string.indexOf('?') >= 0 ||
      string.indexOf('*') >= 0)
  ) {
    return 'exact:' + string
  } else {
    return string
  }
}

class TargetSelector {
  constructor(callback, cleanupCallback) {
    this.callback = callback
    this.cleanupCallback = cleanupCallback
    // This is for XPCOM/XUL addon and can't be used
    //var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    //this.win = wm.getMostRecentWindow('navigator:browser').getBrowser().contentWindow;

    // Instead, we simply assign global content window to this.win
    this.win = window
    const doc = this.win.document
    const div = doc.createElement('div')
    div.setAttribute('style', 'display: none;')
    doc.body.insertBefore(div, doc.body.firstChild)
    this.div = div
    this.e = null
    this.r = null
    doc.addEventListener('mousemove', this, true)
    doc.addEventListener('click', this, true)
  }

  cleanup() {
    try {
      if (this.div) {
        if (this.div.parentNode) {
          this.div.parentNode.removeChild(this.div)
        }
        this.div = null
      }
      if (this.win) {
        const doc = this.win.document
        doc.removeEventListener('mousemove', this, true)
        doc.removeEventListener('click', this, true)
      }
    } catch (e) {
      if (e != "TypeError: can't access dead object") {
        throw e
      }
    }
    this.win = null
    if (this.cleanupCallback) {
      this.cleanupCallback()
    }
  }

  handleEvent(evt) {
    switch (evt.type) {
      case 'mousemove':
        this.highlight(evt.target.ownerDocument, evt.clientX, evt.clientY)
        break
      case 'click':
        if (evt.button == 0 && this.e && this.callback) {
          this.callback(this.e, this.win)
        } //Right click would cancel the select
        evt.preventDefault()
        evt.stopPropagation()
        this.cleanup()
        break
    }
  }

  highlight(doc, x, y) {
    if (doc) {
      const e = doc.elementFromPoint(x, y)
      if (e && e != this.e) {
        this.highlightElement(e)
      }
    }
  }

  highlightElement(element) {
    if (element && element != this.e) {
      this.e = element
    } else {
      return
    }
    const r = element.getBoundingClientRect()
    const or = this.r
    if (r.left >= 0 && r.top >= 0 && r.width > 0 && r.height > 0) {
      if (
        or &&
        r.top == or.top &&
        r.left == or.left &&
        r.width == or.width &&
        r.height == or.height
      ) {
        return
      }
      this.r = r
      const style =
        'pointer-events: none; position: absolute; background-color: rgb(78, 171, 230); opacity: 0.4; border: 1px solid #0e0e0e; z-index: 100;'
      const pos = `top:${r.top + this.win.scrollY}px; left:${r.left +
        this.win.scrollX}px; width:${r.width}px; height:${r.height}px;`
      this.div.setAttribute('style', style + pos)
    } else if (or) {
      this.div.setAttribute('style', 'display: none;')
    }
  }
}

export default TargetSelector
