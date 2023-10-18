/* eslint no-unused-vars: off, no-useless-escape: off */
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

import {singleton as locatorBuilders} from './locator-builders'
import type Recorder from './recorder'
import { isTest } from './utils'

export const handlers: Parameters<Recorder['addEventHandler']>[] = []
export const observers: Parameters<Recorder['addMutationObserver']>[] = []

function eventIsTrusted(event: Event) {
  return isTest ? true : event.isTrusted
}

handlers.push([
  'type',
  'change',
  function (this: Recorder, event) {
    // © Chen-Chieh Ping, SideeX Team
    const target = event.target as HTMLInputElement
    if (
      target.tagName &&
      !this.recordingState.preventType &&
      this.recordingState.typeLock == 0 &&
      (this.recordingState.typeLock = 1)
    ) {
      // END
      let tagName = target.tagName.toLowerCase()
      let type = target.type
      if ('input' == tagName && this.inputTypes.indexOf(type) >= 0) {
        if (target.value.length > 0) {
          this.record(
            event,
            'type',
            locatorBuilders.buildAll(target),
            target.value
          )

          // © Chen-Chieh Ping, SideeX Team
          if (this.recordingState.enterTarget != null) {
            let tempTarget = target.parentElement as HTMLElement
            let formChk = tempTarget.tagName.toLowerCase()
            while (formChk != 'form' && formChk != 'body') {
              tempTarget = tempTarget.parentElement as HTMLElement
              formChk = tempTarget.tagName.toLowerCase()
            }

            this.record(
              event,
              'sendKeys',
              locatorBuilders.buildAll(
                this.recordingState.enterTarget as HTMLElement
              ),
              '${KEY_ENTER}'
            )
            this.recordingState.enterTarget = null
          }
          // END
        } else {
          this.record(
            event,
            'type',
            locatorBuilders.buildAll(target),
            target.value
          )
        }
      } else if ('textarea' == tagName) {
        this.record(
          event,
          'type',
          locatorBuilders.buildAll(target),
          target.value
        )
      }
    }
    this.recordingState.typeLock = 0
  },
])

handlers.push([
  'type',
  'input',
  function (this: Recorder, event) {
    this.recordingState.typeTarget = (event.target as HTMLElement) || null
  },
])

// © Jie-Lin You, SideeX Team
handlers.push([
  'clickAt',
  'click',
  function (this: Recorder, _event) {
    const event = _event as MouseEvent
    if (
      event.button == 0 &&
      !this.recordingState.preventClick &&
      eventIsTrusted(event)
    ) {
      if (!this.recordingState.preventClickTwice) {
        this.record(
          event,
          'click',
          locatorBuilders.buildAll(event.target as HTMLElement),
          ''
        )
        this.recordingState.preventClickTwice = true
      }
      setTimeout(() => {
        this.recordingState.preventClickTwice = false
      }, 30)
    }
  },
  true,
])
// END

// © Chen-Chieh Ping, SideeX Team
handlers.push([
  'doubleClickAt',
  'dblclick',
  function (this: Recorder, event) {
    this.record(
      event,
      'doubleClick',
      locatorBuilders.buildAll(event.target as HTMLElement),
      ''
    )
  },
  true,
])
// END

handlers.push([
  'sendKeys',
  'keydown',
  function (this: Recorder, _event) {
    const event = _event as KeyboardEvent
    const target = event.target as HTMLInputElement
    console.log(event)
    if (target.tagName) {
      let key = event.keyCode
      let tagName = target.tagName.toLowerCase()
      let type = target.type
      if (tagName == 'input' && this.inputTypes.indexOf(type) >= 0) {
        if (key == 13) {
          this.recordingState.enterTarget = target
          this.recordingState.enterValue = target.value
          let tempTarget = target.parentElement as HTMLElement
          let formChk = tempTarget.tagName.toLowerCase()
          if (
            this.recordingState.tempValue == target.value &&
            this.recordingState.tabCheck == this.recordingState.enterTarget
          ) {
            this.record(
              event,
              'sendKeys',
              locatorBuilders.buildAll(this.recordingState.enterTarget),
              '${KEY_ENTER}'
            )
            this.recordingState.enterTarget = null
            this.recordingState.preventType = true
          } else if (
            this.recordingState.focusValue == this.recordingState.enterValue
          ) {
            while (formChk != 'form' && formChk != 'body') {
              tempTarget = tempTarget.parentElement as HTMLElement
              formChk = tempTarget.tagName.toLowerCase()
            }
            this.record(
              event,
              'sendKeys',
              locatorBuilders.buildAll(
                this.recordingState.enterTarget as HTMLElement
              ),
              '${KEY_ENTER}'
            )
            this.recordingState.enterTarget = null
          }
          const typeTarget = this.recordingState.typeTarget as HTMLInputElement
          if (
            typeTarget &&
            typeTarget.tagName &&
            !this.recordingState.preventType &&
            (this.recordingState.typeLock = 1)
          ) {
            // END
            tagName = typeTarget.tagName.toLowerCase()
            type = typeTarget.type
            if ('input' == tagName && this.inputTypes.indexOf(type) >= 0) {
              if (typeTarget.value.length > 0) {
                this.record(
                  event,
                  'type',
                  locatorBuilders.buildAll(typeTarget),
                  typeTarget.value
                )

                // © Chen-Chieh Ping, SideeX Team
                if (this.recordingState.enterTarget != null) {
                  tempTarget = typeTarget.parentElement as HTMLElement
                  formChk = tempTarget.tagName.toLowerCase()
                  while (formChk != 'form' && formChk != 'body') {
                    tempTarget = tempTarget.parentElement as HTMLElement
                    formChk = tempTarget.tagName.toLowerCase()
                  }
                  this.record(
                    event,
                    'sendKeys',
                    locatorBuilders.buildAll(
                      this.recordingState.enterTarget as HTMLElement
                    ),
                    '${KEY_ENTER}'
                  )
                  this.recordingState.enterTarget = null
                }
                // END
              } else {
                this.record(
                  event,
                  'type',
                  locatorBuilders.buildAll(typeTarget),
                  typeTarget.value
                )
              }
            } else if ('textarea' == tagName) {
              this.record(
                event,
                'type',
                locatorBuilders.buildAll(typeTarget),
                typeTarget.value
              )
            }
          }
          this.recordingState.preventClick = true
          setTimeout(() => {
            this.recordingState.preventClick = false
          }, 500)
          setTimeout(() => {
            if (this.recordingState.enterValue != target.value)
              this.recordingState.enterTarget = null
          }, 50)
        }

        let tempbool = false
        if ((key == 38 || key == 40) && target.value != '') {
          if (
            this.recordingState.focusTarget != null &&
            this.recordingState.focusTarget.value !=
              this.recordingState.tempValue
          ) {
            tempbool = true
            this.recordingState.tempValue =
              this.recordingState.focusTarget.value
          }
          if (tempbool) {
            this.record(
              event,
              'type',
              locatorBuilders.buildAll(target),
              this.recordingState.tempValue as string
            )
          }

          setTimeout(() => {
            this.recordingState.tempValue = (
              this.recordingState.focusTarget as HTMLInputElement
            ).value
          }, 250)

          if (key == 38)
            this.record(
              event,
              'sendKeys',
              locatorBuilders.buildAll(target),
              '${KEY_UP}'
            )
          else
            this.record(
              event,
              'sendKeys',
              locatorBuilders.buildAll(target),
              '${KEY_DOWN}'
            )
          this.recordingState.tabCheck = target
        }
        if (key == 9) {
          if (this.recordingState.tabCheck == target) {
            this.record(
              event,
              'sendKeys',
              locatorBuilders.buildAll(target),
              '${KEY_TAB}'
            )
            this.recordingState.preventType = true
          }
        }
      }
    }
  },
  true,
])
// END

let mousedown: MouseEvent | undefined,
  selectMouseup: NodeJS.Timeout,
  selectMousedown: MouseEvent | undefined,
  mouseoverQ: MouseEvent[] | undefined = []

// © Shuo-Heng Shih, SideeX Team
handlers.push([
  'dragAndDrop',
  'mousedown',
  function (this: Recorder, _event) {
    const event = _event as MouseEvent
    if (
      event.clientX < window.document.documentElement.clientWidth &&
      event.clientY < window.document.documentElement.clientHeight
    ) {
      mousedown = event
      setTimeout(() => {
        mousedown = undefined
      }, 200)

      selectMouseup = setTimeout(() => {
        selectMousedown = event
      }, 200)
    }
    mouseoverQ = []
    const target = event.target as HTMLSelectElement
    if (target.nodeName) {
      let tagName = target.nodeName.toLowerCase()
      if ('option' == tagName) {
        let parent = target.parentNode as HTMLSelectElement
        if (parent.multiple) {
          let options = parent.options
          for (let i = 0; i < options.length; i++) {
            // @ts-expect-error
            options[i]._wasSelected = options[i].selected
          }
        }
      }
    }
  },
  true,
])
// END

// © Shuo-Heng Shih, SideeX Team
handlers.push([
  'dragAndDrop',
  'mouseup',
  function (this: Recorder, _event) {
    const event = _event as MouseEvent
    const currentTarget = event.target as HTMLElement
    function getSelectionText() {
      let text = ''
      let activeEl = window.document.activeElement as HTMLInputElement
      let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null
      if (activeElTagName == 'textarea' || activeElTagName == 'input') {
        text = activeEl.value.slice(
          activeEl.selectionStart || 0,
          activeEl.selectionEnd || undefined
        )
      } else if (window.getSelection) {
        text = (window.getSelection() as Selection).toString()
      }
      return text.trim()
    }
    clearTimeout(selectMouseup)
    if (selectMousedown) {
      const target = selectMousedown.target as HTMLElement
      let x = event.clientX - selectMousedown.clientX
      let y = event.clientY - selectMousedown.clientY

      if (
        selectMousedown &&
        event.button === 0 &&
        x + y &&
        event.clientX < window.document.documentElement.clientWidth &&
        event.clientY < window.document.documentElement.clientHeight &&
        getSelectionText() === ''
      ) {
        let sourceRelateX =
          selectMousedown.pageX -
          target.getBoundingClientRect().left -
          window.scrollX
        let sourceRelateY =
          selectMousedown.pageY -
          target.getBoundingClientRect().top -
          window.scrollY
        let targetRelateX, targetRelateY
        const q0 = mouseoverQ?.[0] as MouseEvent
        const q1 = mouseoverQ?.[1] as MouseEvent
        if (
          mouseoverQ?.length &&
          q1.relatedTarget === q0.target &&
          q0.target === event.target
        ) {
          const q1Target = q1.target as HTMLElement
          targetRelateX =
            event.pageX - q1Target.getBoundingClientRect().left - window.scrollX
          targetRelateY =
            event.pageY - q1Target.getBoundingClientRect().top - window.scrollY
          this.record(
            event,
            'mouseDownAt',
            locatorBuilders.buildAll(target),
            sourceRelateX + ',' + sourceRelateY
          )
          this.record(
            event,
            'mouseMoveAt',
            locatorBuilders.buildAll(q1Target),
            targetRelateX + ',' + targetRelateY
          )
          this.record(
            event,
            'mouseUpAt',
            locatorBuilders.buildAll(q1Target),
            targetRelateX + ',' + targetRelateY
          )
        } else {
          targetRelateX =
            event.pageX -
            currentTarget.getBoundingClientRect().left -
            window.scrollX
          targetRelateY =
            event.pageY -
            currentTarget.getBoundingClientRect().top -
            window.scrollY
          this.record(
            event,
            'mouseDownAt',
            locatorBuilders.buildAll(currentTarget),
            targetRelateX + ',' + targetRelateY
          )
          this.record(
            event,
            'mouseMoveAt',
            locatorBuilders.buildAll(currentTarget),
            targetRelateX + ',' + targetRelateY
          )
          this.record(
            event,
            'mouseUpAt',
            locatorBuilders.buildAll(currentTarget),
            targetRelateX + ',' + targetRelateY
          )
        }
      }
    } else {
      let x = event.clientX - (mousedown as MouseEvent).clientX
      let y = event.clientY - (mousedown as MouseEvent).clientY

      if (mousedown && mousedown.target !== event.target && !(x + y)) {
        this.record(
          event,
          'mouseDown',
          locatorBuilders.buildAll(mousedown.target as HTMLElement),
          ''
        )
        this.record(
          event,
          'mouseUp',
          locatorBuilders.buildAll(currentTarget),
          ''
        )
      } else if (mousedown && mousedown.target === currentTarget) {
        // let target = locatorBuilders.buildAll(mousedown.target as HTMLElement)
        // setTimeout(function() {
        //     if (!self.clickLocator)
        //         this.record(event, "click", target, '');
        // }.bind(this), 100);
      }
    }
    mousedown = undefined
    selectMousedown = undefined
    mouseoverQ = undefined
  },
  true,
])
// END

let dropLocator: NodeJS.Timeout | undefined,
  dragstartLocator: MouseEvent | undefined
// © Shuo-Heng Shih, SideeX Team
handlers.push([
  'dragAndDropToObject',
  'dragstart',
  function (event) {
    dropLocator = setTimeout(() => {
      dragstartLocator = event as MouseEvent
    }, 200)
  },
  true,
])
// END

// © Shuo-Heng Shih, SideeX Team
handlers.push([
  'dragAndDropToObject',
  'drop',
  function (this: Recorder, _event) {
    const event = _event as MouseEvent
    clearTimeout(dropLocator as NodeJS.Timeout)
    if (
      dragstartLocator &&
      event.button == 0 &&
      dragstartLocator.target !== event.target
    ) {
      //value no option
      this.record(
        event,
        'dragAndDropToObject',
        locatorBuilders.buildAll(dragstartLocator.target as HTMLElement),
        locatorBuilders.buildAll(event.target as HTMLElement)
      )
    }
    dragstartLocator = undefined
    selectMousedown = undefined
  },
  true,
])
// END

// © Shuo-Heng Shih, SideeX Team
let prevTimeOut: NodeJS.Timeout | null = null,
  scrollDetector: HTMLElement | undefined
handlers.push([
  'runScript',
  'scroll',
  function (event) {
    if (pageLoaded === true) {
      scrollDetector = event.target as HTMLElement
      clearTimeout(prevTimeOut as NodeJS.Timeout)
      prevTimeOut = setTimeout(() => {
        scrollDetector = undefined
      }, 500)
    }
  },
  true,
])
// END

// © Shuo-Heng Shih, SideeX Team
let nowNode = 0,
  nodeInsertedLocator: HTMLElement | undefined,
  nodeInsertedAttrChange: [string, string][] | undefined
handlers.push([
  'mouseOver',
  'mouseover',
  function (event) {
    if (window.document.documentElement)
      nowNode = window.document.documentElement.getElementsByTagName('*').length
    if (pageLoaded === true) {
      let clickable = findClickableElement(event.target as HTMLInputElement)
      if (clickable) {
        nodeInsertedLocator = event.target as HTMLElement
        nodeInsertedAttrChange = locatorBuilders.buildAll(
          event.target as HTMLElement
        )
        setTimeout(() => {
          nodeInsertedLocator = undefined
          nodeInsertedAttrChange = undefined
        }, 500)
      }
      //drop target overlapping
      if (mouseoverQ) {
        //mouse keep down
        if (mouseoverQ.length >= 3) mouseoverQ.shift()
        mouseoverQ.push(event as MouseEvent)
      }
    }
  },
  true,
])
// END

let mouseoutLocator: HTMLElement | undefined = undefined
// © Shuo-Heng Shih, SideeX Team
handlers.push([
  'mouseOut',
  'mouseout',
  function (this: Recorder, event) {
    if (mouseoutLocator !== null && event.target === mouseoutLocator) {
      this.record(
        event,
        'mouseOut',
        locatorBuilders.buildAll(event.target as HTMLElement),
        ''
      )
    }
    mouseoutLocator = undefined
  },
  true,
])
// END

observers.push([
  'FrameDeleted',
  function (this: Recorder, mutations) {
    mutations.forEach(async (mutation) => {
      const removedNodes = await mutation.removedNodes
      if (removedNodes.length && removedNodes[0].nodeName === 'IFRAME') {
        window.sideAPI.recorder.onFrameDeleted.dispatchEvent()
      }
    })
  },
  { childList: true },
])

observers.push([
  'DOMNodeInserted',
  function (this: Recorder, mutations) {
    if (
      pageLoaded === true &&
      window.document.documentElement.getElementsByTagName('*').length > nowNode
    ) {
      // Get list of inserted nodes from the mutations list to simulate 'DOMNodeInserted'.
      const insertedNodes = mutations.reduce((nodes, mutation) => {
        if (mutation.type === 'childList') {
          // @ts-expect-error
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
        this.record(
          mutations,
          'runScript',
          'window.scrollTo(0,' + window.scrollY + ')',
          ''
        )
        pageLoaded = false
        setTimeout(() => {
          pageLoaded = true
        }, 550)
        scrollDetector = undefined
        nodeInsertedLocator = undefined
      }
      if (nodeInsertedLocator) {
        this.record(
          event,
          'mouseOver',
          nodeInsertedAttrChange as [string, string][],
          ''
        )
        mouseoutLocator = nodeInsertedLocator
        nodeInsertedLocator = undefined
        nodeInsertedAttrChange = undefined
        mouseoutLocator = undefined
      }
    }
  },
  { childList: true, subtree: true },
])

// © Shuo-Heng Shih, SideeX Team
let readyTimeOut: NodeJS.Timeout | number | null = null
let pageLoaded = true
handlers.push([
  'checkPageLoaded',
  'readystatechange',
  function (this: Recorder) {
    if (window.document.readyState === 'loading') {
      pageLoaded = false
    } else {
      pageLoaded = false
      clearTimeout(readyTimeOut as number)
      readyTimeOut = setTimeout(() => {
        pageLoaded = true
      }, 1500) //setReady after complete 1.5s
    }
  },
  true,
])
// END

// © Yun-Wen Lin, SideeX Team
let getEle: HTMLElement
let checkFocus = 0
let contentTest: string
handlers.push([
  'editContent',
  'focus',
  function (this: Recorder, event) {
    let editable = (event.target as HTMLElement).contentEditable
    if (editable == 'true') {
      getEle = event.target as HTMLElement
      contentTest = getEle.innerHTML
      checkFocus = 1
    }
  },
  true,
])
// END

// © Yun-Wen Lin, SideeX Team
handlers.push([
  'editContent',
  'blur',
  function (this: Recorder, event) {
    if (checkFocus == 1) {
      if (event.target == getEle) {
        if (getEle.innerHTML != contentTest) {
          this.record(
            event,
            'editContent',
            locatorBuilders.buildAll(event.target as HTMLElement),
            getEle.innerHTML
          )
        }
        checkFocus = 0
      }
    }
  },
  true,
])
// END

function findClickableElement(e: HTMLInputElement): HTMLInputElement | null {
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
      return findClickableElement(e.parentNode as HTMLInputElement)
    } else {
      return null
    }
  }
}

//select / addSelect / removeSelect
handlers.push([
  'select',
  'focus',
  function (this: Recorder, event) {
    const target = event.target as HTMLSelectElement
    if (target.nodeName) {
      let tagName = target.nodeName.toLowerCase()
      if ('select' == tagName && target.multiple) {
        let options = target.options
        for (let i = 0; i < options.length; i++) {
          // @ts-expect-error
          if (options[i]._wasSelected == null) {
            // is the focus was gained by mousedown event, _wasSelected would be already set
            // @ts-expect-error
            options[i]._wasSelected = options[i].selected
          }
        }
      }
    }
  },
  true,
])

handlers.push([
  'select',
  'change',
  function (this: Recorder, event) {
    const target = event.target as HTMLSelectElement
    if (target.tagName) {
      let tagName = target.tagName.toLowerCase()
      if ('select' == tagName) {
        if (!target.multiple) {
          let option = target.options[target.selectedIndex]
          this.record(
            event,
            'select',
            locatorBuilders.buildAll(target),
            getOptionLocator(option)
          )
        } else {
          let options = target.options
          for (let i = 0; i < options.length; i++) {
            // @ts-expect-error
            if (options[i]._wasSelected != options[i].selected) {
              let value = getOptionLocator(options[i])
              if (options[i].selected) {
                this.record(
                  event,
                  'addSelection',
                  locatorBuilders.buildAll(target),
                  value
                )
              } else {
                this.record(
                  event,
                  'removeSelection',
                  locatorBuilders.buildAll(target),
                  value
                )
              }
              // @ts-expect-error
              options[i]._wasSelected = options[i].selected
            }
          }
        }
      }
    }
  },
])

const nbsp = String.fromCharCode(160)
function getOptionLocator(option: HTMLOptionElement) {
  let label = option.text.replace(/^ *(.*?) *$/, '$1')
  if (label.match(new RegExp(nbsp))) {
    // if the text contains &nbsp;
    return (
      'label=mostly-equals:' +
      label
        .replace(/[(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, (str) => `\\${str}`)
        .replace(/\s/g, ' ')
        .trim()
    )
  } else {
    return 'label=' + label
  }
}
