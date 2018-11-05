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

import browser from 'webextension-polyfill'
import goog, { bot } from './closure-polyfill'
import { Recorder, recorder, record } from './record-api'
import { attach } from './prompt-recorder'
import LocatorBuilders from './locatorBuilders'

export { record }
export const locatorBuilders = new LocatorBuilders(window)

attach(record)

let typeTarget
let typeLock = 0
let focusTarget = null
let focusValue = null
let tempValue = null
let preventType = false

Recorder.inputTypes = [
  'text',
  'password',
  'file',
  'datetime',
  'datetime-local',
  'date',
  'month',
  'time',
  'week',
  'number',
  'range',
  'email',
  'url',
  'search',
  'tel',
  'color',
]
Recorder.addEventHandler('type', 'change', function(event) {
  // © Chen-Chieh Ping, SideeX Team
  if (event.target.tagName && !preventType && typeLock == 0 && (typeLock = 1)) {
    // END
    let tagName = event.target.tagName.toLowerCase()
    let type = event.target.type
    if ('input' == tagName && Recorder.inputTypes.indexOf(type) >= 0) {
      if (event.target.value.length > 0) {
        record(
          'type',
          locatorBuilders.buildAll(event.target),
          event.target.value
        )

        // © Chen-Chieh Ping, SideeX Team
        if (enterTarget != null) {
          let tempTarget = event.target.parentElement
          let formChk = tempTarget.tagName.toLowerCase()
          while (formChk != 'form' && formChk != 'body') {
            tempTarget = tempTarget.parentElement
            formChk = tempTarget.tagName.toLowerCase()
          }
          if (
            formChk == 'form' &&
            (tempTarget.hasAttribute('id') ||
              tempTarget.hasAttribute('name')) &&
            !tempTarget.hasAttribute('onsubmit')
          ) {
            if (tempTarget.hasAttribute('id'))
              record('submit', [['id=' + tempTarget.id, 'id']], '')
            else if (tempTarget.hasAttribute('name'))
              record('submit', [['name=' + tempTarget.name, 'name']], '')
          } else
            record(
              'sendKeys',
              locatorBuilders.buildAll(enterTarget),
              '${KEY_ENTER}'
            )
          enterTarget = null
        }
        // END
      } else {
        record(
          'type',
          locatorBuilders.buildAll(event.target),
          event.target.value
        )
      }
    } else if ('textarea' == tagName) {
      record('type', locatorBuilders.buildAll(event.target), event.target.value)
    }
  }
  typeLock = 0
})

Recorder.addEventHandler('type', 'input', function(event) {
  //console.log(event.target);
  typeTarget = event.target
})

// © Jie-Lin You, SideeX Team
let preventClickTwice = false
Recorder.addEventHandler(
  'clickAt',
  'click',
  function(event) {
    if (event.button == 0 && !preventClick && event.isTrusted) {
      if (!preventClickTwice) {
        record('click', locatorBuilders.buildAll(event.target), '')
        preventClickTwice = true
      }
      setTimeout(function() {
        preventClickTwice = false
      }, 30)
    }
  },
  true
)
// END

// © Chen-Chieh Ping, SideeX Team
Recorder.addEventHandler(
  'doubleClickAt',
  'dblclick',
  function(event) {
    record('doubleClick', locatorBuilders.buildAll(event.target), '')
  },
  true
)
// END

// © Chen-Chieh Ping, SideeX Team
let inp = document.getElementsByTagName('input')
for (let i = 0; i < inp.length; i++) {
  if (Recorder.inputTypes.indexOf(inp[i].type) >= 0) {
    inp[i].addEventListener('focus', function(event) {
      focusTarget = event.target
      focusValue = focusTarget.value
      tempValue = focusValue
      preventType = false
    })
    inp[i].addEventListener('blur', function() {
      focusTarget = null
      focusValue = null
      tempValue = null
    })
  }
}
// END

// © Chen-Chieh Ping, SideeX Team
let preventClick = false
let enterTarget = null
let enterValue = null
let tabCheck = null
Recorder.addEventHandler(
  'sendKeys',
  'keydown',
  function(event) {
    if (event.target.tagName) {
      let key = event.keyCode
      let tagName = event.target.tagName.toLowerCase()
      let type = event.target.type
      if (tagName == 'input' && Recorder.inputTypes.indexOf(type) >= 0) {
        if (key == 13) {
          enterTarget = event.target
          enterValue = enterTarget.value
          let tempTarget = event.target.parentElement
          let formChk = tempTarget.tagName.toLowerCase()
          //console.log(tempValue + " " + enterTarget.value + " " + tabCheck + " " + enterTarget + " " + focusValue);
          // console.log(focusValue);
          // console.log(enterTarget.value);
          if (tempValue == enterTarget.value && tabCheck == enterTarget) {
            record(
              'sendKeys',
              locatorBuilders.buildAll(enterTarget),
              '${KEY_ENTER}'
            )
            enterTarget = null
            preventType = true
          } else if (focusValue == enterTarget.value) {
            while (formChk != 'form' && formChk != 'body') {
              tempTarget = tempTarget.parentElement
              formChk = tempTarget.tagName.toLowerCase()
            }
            if (
              formChk == 'form' &&
              (tempTarget.hasAttribute('id') ||
                tempTarget.hasAttribute('name')) &&
              !tempTarget.hasAttribute('onsubmit')
            ) {
              if (tempTarget.hasAttribute('id'))
                record('submit', [['id=' + tempTarget.id]], '')
              else if (tempTarget.hasAttribute('name'))
                record('submit', [['name=' + tempTarget.name]], '')
            } else
              record(
                'sendKeys',
                locatorBuilders.buildAll(enterTarget),
                '${KEY_ENTER}'
              )
            enterTarget = null
          }
          if (typeTarget.tagName && !preventType && (typeLock = 1)) {
            // END
            tagName = typeTarget.tagName.toLowerCase()
            type = typeTarget.type
            if ('input' == tagName && Recorder.inputTypes.indexOf(type) >= 0) {
              if (typeTarget.value.length > 0) {
                record(
                  'type',
                  locatorBuilders.buildAll(typeTarget),
                  typeTarget.value
                )

                // © Chen-Chieh Ping, SideeX Team
                if (enterTarget != null) {
                  tempTarget = typeTarget.parentElement
                  formChk = tempTarget.tagName.toLowerCase()
                  while (formChk != 'form' && formChk != 'body') {
                    tempTarget = tempTarget.parentElement
                    formChk = tempTarget.tagName.toLowerCase()
                  }
                  if (
                    formChk == 'form' &&
                    (tempTarget.hasAttribute('id') ||
                      tempTarget.hasAttribute('name')) &&
                    !tempTarget.hasAttribute('onsubmit')
                  ) {
                    if (tempTarget.hasAttribute('id'))
                      record('submit', [['id=' + tempTarget.id, 'id']], '')
                    else if (tempTarget.hasAttribute('name'))
                      record(
                        'submit',
                        [['name=' + tempTarget.name, 'name']],
                        ''
                      )
                  } else
                    record(
                      'sendKeys',
                      locatorBuilders.buildAll(enterTarget),
                      '${KEY_ENTER}'
                    )
                  enterTarget = null
                }
                // END
              } else {
                record(
                  'type',
                  locatorBuilders.buildAll(typeTarget),
                  typeTarget.value
                )
              }
            } else if ('textarea' == tagName) {
              record(
                'type',
                locatorBuilders.buildAll(typeTarget),
                typeTarget.value
              )
            }
          }
          preventClick = true
          setTimeout(function() {
            preventClick = false
          }, 500)
          setTimeout(function() {
            if (enterValue != event.target.value) enterTarget = null
          }, 50)
        }

        let tempbool = false
        if ((key == 38 || key == 40) && event.target.value != '') {
          if (focusTarget != null && focusTarget.value != tempValue) {
            tempbool = true
            tempValue = focusTarget.value
          }
          if (tempbool) {
            record('type', locatorBuilders.buildAll(event.target), tempValue)
          }

          setTimeout(function() {
            tempValue = focusTarget.value
          }, 250)

          if (key == 38)
            record(
              'sendKeys',
              locatorBuilders.buildAll(event.target),
              '${KEY_UP}'
            )
          else
            record(
              'sendKeys',
              locatorBuilders.buildAll(event.target),
              '${KEY_DOWN}'
            )
          tabCheck = event.target
        }
        if (key == 9) {
          if (tabCheck == event.target) {
            record(
              'sendKeys',
              locatorBuilders.buildAll(event.target),
              '${KEY_TAB}'
            )
            preventType = true
          }
        }
      }
    }
  },
  true
)
// END

// eslint-disable-next-line no-unused-vars
let mousedown, mouseup, selectMouseup, selectMousedown, mouseoverQ, clickLocator
// © Shuo-Heng Shih, SideeX Team
Recorder.addEventHandler(
  'dragAndDrop',
  'mousedown',
  function(event) {
    if (
      event.clientX < window.document.documentElement.clientWidth &&
      event.clientY < window.document.documentElement.clientHeight
    ) {
      mousedown = event
      mouseup = setTimeout(
        function() {
          mousedown = undefined
        }.bind(this),
        200
      )

      selectMouseup = setTimeout(
        function() {
          selectMousedown = event
        }.bind(this),
        200
      )
    }
    mouseoverQ = []

    if (event.target.nodeName) {
      let tagName = event.target.nodeName.toLowerCase()
      if ('option' == tagName) {
        let parent = event.target.parentNode
        if (parent.multiple) {
          let options = parent.options
          for (let i = 0; i < options.length; i++) {
            options[i]._wasSelected = options[i].selected
          }
        }
      }
    }
  },
  true
)
// END

// © Shuo-Heng Shih, SideeX Team
Recorder.addEventHandler(
  'dragAndDrop',
  'mouseup',
  function(event) {
    function getSelectionText() {
      let text = ''
      let activeEl = window.document.activeElement
      let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null
      if (activeElTagName == 'textarea' || activeElTagName == 'input') {
        text = activeEl.value.slice(
          activeEl.selectionStart,
          activeEl.selectionEnd
        )
      } else if (window.getSelection) {
        text = window.getSelection().toString()
      }
      return text.trim()
    }
    clearTimeout(selectMouseup)
    if (selectMousedown) {
      let x = event.clientX - selectMousedown.clientX
      let y = event.clientY - selectMousedown.clientY

      if (
        selectMousedown &&
        event.button === 0 &&
        x + y &&
        (event.clientX < window.document.documentElement.clientWidth &&
          event.clientY < window.document.documentElement.clientHeight) &&
        getSelectionText() === ''
      ) {
        let sourceRelateX =
          selectMousedown.pageX -
          selectMousedown.target.getBoundingClientRect().left -
          window.scrollX
        let sourceRelateY =
          selectMousedown.pageY -
          selectMousedown.target.getBoundingClientRect().top -
          window.scrollY
        let targetRelateX, targetRelateY
        if (
          !!mouseoverQ.length &&
          mouseoverQ[1].relatedTarget == mouseoverQ[0].target &&
          mouseoverQ[0].target == event.target
        ) {
          targetRelateX =
            event.pageX -
            mouseoverQ[1].target.getBoundingClientRect().left -
            window.scrollX
          targetRelateY =
            event.pageY -
            mouseoverQ[1].target.getBoundingClientRect().top -
            window.scrollY
          record(
            'mouseDownAt',
            locatorBuilders.buildAll(selectMousedown.target),
            sourceRelateX + ',' + sourceRelateY
          )
          record(
            'mouseMoveAt',
            locatorBuilders.buildAll(mouseoverQ[1].target),
            targetRelateX + ',' + targetRelateY
          )
          record(
            'mouseUpAt',
            locatorBuilders.buildAll(mouseoverQ[1].target),
            targetRelateX + ',' + targetRelateY
          )
        } else {
          targetRelateX =
            event.pageX -
            event.target.getBoundingClientRect().left -
            window.scrollX
          targetRelateY =
            event.pageY -
            event.target.getBoundingClientRect().top -
            window.scrollY
          record(
            'mouseDownAt',
            locatorBuilders.buildAll(event.target),
            targetRelateX + ',' + targetRelateY
          )
          record(
            'mouseMoveAt',
            locatorBuilders.buildAll(event.target),
            targetRelateX + ',' + targetRelateY
          )
          record(
            'mouseUpAt',
            locatorBuilders.buildAll(event.target),
            targetRelateX + ',' + targetRelateY
          )
        }
      }
    } else {
      clickLocator = undefined
      mouseup = undefined
      let x = event.clientX - mousedown.clientX
      let y = event.clientY - mousedown.clientY

      if (mousedown && mousedown.target !== event.target && !(x + y)) {
        record('mouseDown', locatorBuilders.buildAll(mousedown.target), '')
        record('mouseUp', locatorBuilders.buildAll(event.target), '')
      } else if (mousedown && mousedown.target === event.target) {
        let _target = locatorBuilders.buildAll(mousedown.target)
        // setTimeout(function() {
        //     if (!self.clickLocator)
        //         record("click", target, '');
        // }.bind(this), 100);
      }
    }
    mousedown = undefined
    selectMousedown = undefined
    mouseoverQ = undefined
  },
  true
)
// END

let dropLocator, dragstartLocator
// © Shuo-Heng Shih, SideeX Team
Recorder.addEventHandler(
  'dragAndDropToObject',
  'dragstart',
  function(event) {
    dropLocator = setTimeout(
      function() {
        dragstartLocator = event
      }.bind(this),
      200
    )
  },
  true
)
// END

// © Shuo-Heng Shih, SideeX Team
Recorder.addEventHandler(
  'dragAndDropToObject',
  'drop',
  function(event) {
    clearTimeout(dropLocator)
    if (
      dragstartLocator &&
      event.button == 0 &&
      dragstartLocator.target !== event.target
    ) {
      //value no option
      record(
        'dragAndDropToObject',
        locatorBuilders.buildAll(dragstartLocator.target),
        locatorBuilders.build(event.target)
      )
    }
    dragstartLocator = undefined
    selectMousedown = undefined
  },
  true
)
// END

// © Shuo-Heng Shih, SideeX Team
let prevTimeOut = null,
  scrollDetector
Recorder.addEventHandler(
  'runScript',
  'scroll',
  function(event) {
    if (pageLoaded === true) {
      scrollDetector = event.target
      clearTimeout(prevTimeOut)
      prevTimeOut = setTimeout(function() {
        scrollDetector = undefined
      }, 500)
    }
  },
  true
)
// END

// © Shuo-Heng Shih, SideeX Team
let nowNode = 0,
  mouseoverLocator, // eslint-disable-line no-unused-vars
  nodeInsertedLocator,
  nodeAttrChange, // eslint-disable-line no-unused-vars
  nodeAttrChangeTimeout // eslint-disable-line no-unused-vars
Recorder.addEventHandler(
  'mouseOver',
  'mouseover',
  function(event) {
    if (window.document.documentElement)
      nowNode = window.document.documentElement.getElementsByTagName('*').length
    if (pageLoaded === true) {
      let clickable = findClickableElement(event.target)
      if (clickable) {
        nodeInsertedLocator = event.target
        setTimeout(function() {
          nodeInsertedLocator = undefined
        }, 500)

        nodeAttrChange = locatorBuilders.buildAll(event.target)
        nodeAttrChangeTimeout = setTimeout(function() {
          nodeAttrChange = undefined
        }, 10)
      }
      //drop target overlapping
      if (mouseoverQ) {
        //mouse keep down
        if (mouseoverQ.length >= 3) mouseoverQ.shift()
        mouseoverQ.push(event)
      }
    }
  },
  true
)
// END

let mouseoutLocator = undefined
// © Shuo-Heng Shih, SideeX Team
Recorder.addEventHandler(
  'mouseOut',
  'mouseout',
  function(event) {
    if (mouseoutLocator !== null && event.target === mouseoutLocator) {
      record('mouseOut', locatorBuilders.buildAll(event.target), '')
    }
    mouseoutLocator = undefined
  },
  true
)
// END

Recorder.addMutationObserver(
  'DOMNodeInserted',
  function(mutations) {
    if (
      pageLoaded === true &&
      window.document.documentElement.getElementsByTagName('*').length > nowNode
    ) {
      // Get list of inserted nodes from the mutations list to simulate 'DOMNodeInserted'.
      const insertedNodes = mutations.reduce((nodes, mutation) => {
        if (mutation.type === 'childList') {
          nodes.push.apply(nodes, mutation.addedNodes)
        }
        return nodes
      }, [])
      // If no nodes inserted, just bail.
      if (!insertedNodes.length) {
        return
      }

      if (scrollDetector) {
        //TODO: fix target
        record('runScript', [['window.scrollTo(0,' + window.scrollY + ')']], '')
        pageLoaded = false
        setTimeout(function() {
          pageLoaded = true
        }, 550)
        scrollDetector = undefined
        nodeInsertedLocator = undefined
      }
      if (nodeInsertedLocator) {
        record('mouseOver', locatorBuilders.buildAll(nodeInsertedLocator), '')
        mouseoutLocator = nodeInsertedLocator
        nodeInsertedLocator = undefined
        mouseoverLocator = undefined
      }
    }
  },
  { childList: true, subtree: true }
)

// © Shuo-Heng Shih, SideeX Team
let readyTimeOut = null
let pageLoaded = true
Recorder.addEventHandler(
  'checkPageLoaded',
  'readystatechange',
  function(_event) {
    if (window.document.readyState === 'loading') {
      pageLoaded = false
    } else {
      pageLoaded = false
      clearTimeout(readyTimeOut)
      readyTimeOut = setTimeout(function() {
        pageLoaded = true
      }, 1500) //setReady after complete 1.5s
    }
  },
  true
)
// END

// © Ming-Hung Hsu, SideeX Team
Recorder.addEventHandler(
  'contextMenu',
  'contextmenu',
  function(event) {
    let myPort = browser.runtime.connect()
    let tmpText = locatorBuilders.buildAll(event.target)
    let tmpVal = bot.dom.getVisibleText(event.target)
    let tmpTitle = goog.string.normalizeSpaces(event.target.ownerDocument.title)
    myPort.onMessage.addListener(function(m) {
      if (m.cmd.includes('Text')) {
        record(m.cmd, tmpText, tmpVal)
      } else if (m.cmd.includes('Title')) {
        record(m.cmd, [[tmpTitle]], '')
      } else if (m.cmd.includes('Value')) {
        record(m.cmd, tmpText, event.target.value)
      } else if (m.cmd === 'mouseOver') {
        record('mouseOver', locatorBuilders.buildAll(event.target), '')
      }
      myPort.onMessage.removeListener(this)
    })
  },
  true
)
// END

// © Yun-Wen Lin, SideeX Team
let getEle
let checkFocus = 0
let contentTest
Recorder.addEventHandler(
  'editContent',
  'focus',
  function(event) {
    let editable = event.target.contentEditable
    if (editable == 'true') {
      getEle = event.target
      contentTest = getEle.innerHTML
      checkFocus = 1
    }
  },
  true
)
// END

// © Yun-Wen Lin, SideeX Team
Recorder.addEventHandler(
  'editContent',
  'blur',
  function(event) {
    if (checkFocus == 1) {
      if (event.target == getEle) {
        if (getEle.innerHTML != contentTest) {
          record(
            'editContent',
            locatorBuilders.buildAll(event.target),
            getEle.innerHTML
          )
        }
        checkFocus = 0
      }
    }
  },
  true
)
// END

browser.runtime
  .sendMessage({
    attachRecorderRequest: true,
  })
  .catch(function(_reason) {
    // Failed silently if receiveing end does not exist
  })

// Copyright 2005 Shinya Kasatani
Recorder.prototype.getOptionLocator = function(option) {
  let label = option.text.replace(/^ *(.*?) *$/, '$1')
  if (label.match(/\xA0/)) {
    // if the text contains &nbsp;
    return (
      'label=regexp:' +
      label
        // eslint-disable-next-line no-useless-escape
        .replace(/[\(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function(str) {
          return '\\' + str
        })
        .replace(/\s+/g, function(str) {
          if (str.match(/\xA0/)) {
            if (str.length > 1) {
              return '\\s+'
            } else {
              return '\\s'
            }
          } else {
            return str
          }
        })
    )
  } else {
    return 'label=' + label
  }
}

function findClickableElement(e) {
  if (!e.tagName) return null
  let tagName = e.tagName.toLowerCase()
  let type = e.type
  if (
    e.hasAttribute('onclick') ||
    e.hasAttribute('href') ||
    tagName == 'button' ||
    (tagName == 'input' &&
      (type == 'submit' ||
        type == 'button' ||
        type == 'image' ||
        type == 'radio' ||
        type == 'checkbox' ||
        type == 'reset'))
  ) {
    return e
  } else {
    if (e.parentNode != null) {
      return findClickableElement(e.parentNode)
    } else {
      return null
    }
  }
}

//select / addSelect / removeSelect
Recorder.addEventHandler(
  'select',
  'focus',
  function(event) {
    if (event.target.nodeName) {
      let tagName = event.target.nodeName.toLowerCase()
      if ('select' == tagName && event.target.multiple) {
        let options = event.target.options
        for (let i = 0; i < options.length; i++) {
          if (options[i]._wasSelected == null) {
            // is the focus was gained by mousedown event, _wasSelected would be already set
            options[i]._wasSelected = options[i].selected
          }
        }
      }
    }
  },
  true
)

Recorder.addEventHandler('select', 'change', function(event) {
  if (event.target.tagName) {
    let tagName = event.target.tagName.toLowerCase()
    if ('select' == tagName) {
      if (!event.target.multiple) {
        let option = event.target.options[event.target.selectedIndex]
        record(
          'select',
          locatorBuilders.buildAll(event.target),
          getOptionLocator(option)
        )
      } else {
        let options = event.target.options
        for (let i = 0; i < options.length; i++) {
          if (options[i]._wasSelected != options[i].selected) {
            let value = getOptionLocator(options[i])
            if (options[i].selected) {
              record(
                'addSelection',
                locatorBuilders.buildAll(event.target),
                value
              )
            } else {
              record(
                'removeSelection',
                locatorBuilders.buildAll(event.target),
                value
              )
            }
            options[i]._wasSelected = options[i].selected
          }
        }
      }
    }
  }
})

function getOptionLocator(option) {
  let label = option.text.replace(/^ *(.*?) *$/, '$1')
  if (label.match(/\xA0/)) {
    // if the text contains &nbsp;
    return (
      'label=regexp:' +
      label
        // eslint-disable-next-line no-useless-escape
        .replace(/[(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function(str) {
          return '\\' + str
        })
        .replace(/\s+/g, function(str) {
          if (str.match(/\xA0/)) {
            if (str.length > 1) {
              return '\\s+'
            } else {
              return '\\s'
            }
          } else {
            return str
          }
        })
    )
  } else {
    return 'label=' + label
  }
}

browser.runtime
  .sendMessage({
    attachRecorderRequest: true,
  })
  .then(shouldAttach => {
    if (shouldAttach) {
      recorder.attach()
    }
  })
  .catch(() => {})
