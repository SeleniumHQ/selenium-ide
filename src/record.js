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

import browser from "webextension-polyfill";
import { Recorder, recorder, record } from "./record-api";
import LocatorBuilders from "./locatorBuilders";

const getText = window.global.getText;
const normalizeSpaces = window.global.normalizeSpaces;

export const locatorBuilders = new LocatorBuilders(window);

let preventClickTwice = false;
if (Recorder) {
  Recorder.addEventHandler("clickAt", "click", function(event) {
    if (event.button == 0 && !preventClick && event.isTrusted) {
      if (!preventClickTwice) {
        let top = event.pageY,
          left = event.pageX;
        let element = event.target;
        do {
          top -= element.offsetTop;
          left -= element.offsetLeft;
          element = element.offsetParent;
        } while (element);
        record("clickAt", locatorBuilders.buildAll(event.target), left + "," + top);
        preventClickTwice = true;
      }
      setTimeout(function() { preventClickTwice = false; }, 30);
    }
  }, true);

  //Record: doubleClickAt
  Recorder.addEventHandler("doubleClickAt", "dblclick", function(event) {
    let top = event.pageY,
      left = event.pageX;
    let element = event.target;
    do {
      top -= element.offsetTop;
      left -= element.offsetLeft;
      element = element.offsetParent;
    } while (element);
    record("doubleClickAt", locatorBuilders.buildAll(event.target), left + "," + top);
  }, true);

  //Record: SendKeys
  const inputTypes = ["text", "password", "file", "datetime", "datetime-local", "date", "month", "time", "week", "number", "range", "email", "url", "search", "tel", "color"];
  let focusTarget = null;
  let focusValue = null;
  let tempValue = null;
  let preventType = false;
  const inp = document.getElementsByTagName("input");
  for (let i = 0; i < inp.length; i++) {
    if (inputTypes.indexOf(inp[i].type) >= 0) {
      inp[i].addEventListener("focus", function(event) {
        focusTarget = event.target;
        focusValue = focusTarget.value;
        tempValue = focusValue;
        preventType = false;
      });
      inp[i].addEventListener("blur", function() {
        focusTarget = null;
        focusValue = null;
        tempValue = null;
      });
    }
  }

  let preventClick = false;
  let enterTarget = null;
  let enterValue = null;
  let tabCheck = null;
  Recorder.addEventHandler("sendKeys", "keydown", function(event) {
    if (event.target.tagName) {
      const key = event.keyCode;
      const tagName = event.target.tagName.toLowerCase();
      const type = event.target.type;
      if (tagName == "input" && inputTypes.indexOf(type) >= 0) {
        if (key == 13) {
          enterTarget = event.target;
          enterValue = enterTarget.value;
          let tempTarget = event.target.parentElement;
          let formChk = tempTarget.tagName.toLowerCase();
          if (tempValue == enterTarget.value && tabCheck == enterTarget) {
            record("sendKeys", locatorBuilders.buildAll(enterTarget), "${KEY_ENTER}");
            enterTarget = null;
            preventType = true;
          } else if (focusValue == enterTarget.value) {
            while (formChk != "form" && formChk != "body") {
              tempTarget = tempTarget.parentElement;
              formChk = tempTarget.tagName.toLowerCase();
            }
            if (formChk == "form" && (tempTarget.hasAttribute("id") || tempTarget.hasAttribute("name")) && (!tempTarget.hasAttribute("onsubmit"))) {
              if (tempTarget.hasAttribute("id"))
                record("submit", "id=" + tempTarget.id, "");
              else if (tempTarget.hasAttribute("name"))
                record("submit", "name=" + tempTarget.name, "");
            } else
              record("sendKeys", locatorBuilders.buildAll(enterTarget), "${KEY_ENTER}");
            enterTarget = null;
          }
          preventClick = true;
          setTimeout(function() {
            preventClick = false;
          }, 500);
          setTimeout(function() {
            if (enterValue != event.target.value) enterTarget = null;
          }, 50);
        }

        //SuggestionDropDownExt, Chen-Chieh Ping, SELAB, CSIE, NCKU, 2016/11/10
        let tempbool = false;
        if ((key == 38 || key == 40) && event.target.value != "") {
          if (focusTarget != null && focusTarget.value != tempValue) {
            tempbool = true;
            tempValue = focusTarget.value;
          }
          if (tempbool) {
            record("type", locatorBuilders.buildAll(event.target), tempValue);
          }

          setTimeout(function() {
            tempValue = focusTarget.value;
          }, 250);

          if (key == 38) record("sendKeys", locatorBuilders.buildAll(event.target), "${KEY_UP}");
          else record("sendKeys", locatorBuilders.buildAll(event.target), "${KEY_DOWN}");
          tabCheck = event.target;
        }
        if (key == 9) {
          if (tabCheck == event.target) {
            record("sendKeys", locatorBuilders.buildAll(event.target), "${KEY_TAB}");
            preventType = true;
          }
        }
      }
    }
  }, true);

  //Recoed: Type
  Recorder.addEventHandler("Type", "change", function(event) {
    if (event.target.tagName && !preventType) {
      const tagName = event.target.tagName.toLowerCase();
      const type = event.target.type;
      if ("input" == tagName && inputTypes.indexOf(type) >= 0) {
        if (event.target.value.length > 0) {
          record("type", locatorBuilders.buildAll(event.target), event.target.value);

          //FormSubmitByEnterKeyExt, Chen-Chieh Ping, SELAB, CSIE, NCKU, 2016/10/07
          if (enterTarget != null) {
            //FormSubmitByEnterKeyExt & UnnamedWinIFrameExt, Jie-Lin You, SELAB, CSIE, NCKU, 2016/10/18
            let tempTarget = event.target.parentElement;
            let formChk = tempTarget.tagName.toLowerCase();
            while (formChk != "form" && formChk != "body") {
              tempTarget = tempTarget.parentElement;
              formChk = tempTarget.tagName.toLowerCase();
            }
            if (formChk == "form" && (tempTarget.hasAttribute("id") || tempTarget.hasAttribute("name")) && (!tempTarget.hasAttribute("onsubmit"))) {
              if (tempTarget.hasAttribute("id"))
                record("submit", [
                  ["id=" + tempTarget.id, "id"]
                ], "");
              else if (tempTarget.hasAttribute("name"))
                record("submit", [
                  ["name=" + tempTarget.name, "name"]
                ], "");
            } else
              record("sendKeys", locatorBuilders.buildAll(enterTarget), "${KEY_ENTER}");
            enterTarget = null;
          }
        } else {
          record("type", locatorBuilders.buildAll(event.target), event.target.value);
        }
      } else if ("textarea" == tagName) {
        record("type", locatorBuilders.buildAll(event.target), event.target.value);
      }
    }
  });

  //select / addSelect / removeSelect
  Recorder.addEventHandler("select", "focus", function(event) {
    if (event.target.nodeName) {
      let tagName = event.target.nodeName.toLowerCase();
      if ("select" == tagName && event.target.multiple) {
        let options = event.target.options;
        for (let i = 0; i < options.length; i++) {
          if (options[i]._wasSelected == null) {
            // is the focus was gained by mousedown event, _wasSelected would be already set
            options[i]._wasSelected = options[i].selected;
          }
        }
      }
    }
  }, true);

  Recorder.addEventHandler("select", "change", function(event) {
    if (event.target.tagName) {
      let tagName = event.target.tagName.toLowerCase();
      if ("select" == tagName) {
        if (!event.target.multiple) {
          let option = event.target.options[event.target.selectedIndex];
          record("select", locatorBuilders.buildAll(event.target), getOptionLocator(option));
        } else {
          let options = event.target.options;
          for (let i = 0; i < options.length; i++) {
            if (options[i]._wasSelected != options[i].selected) {
              let value = getOptionLocator(options[i]);
              if (options[i].selected) {
                record("addSelection", locatorBuilders.buildAll(event.target), value);
              } else {
                record("removeSelection", locatorBuilders.buildAll(event.target), value);
              }
              options[i]._wasSelected = options[i].selected;
            }
          }
        }
      }
    }
  });

  function getOptionLocator(option) {
    let label = option.text.replace(/^ *(.*?) *$/, "$1");
    if (label.match(/\xA0/)) { // if the text contains &nbsp;
      return "label=regexp:" + label.replace(/[(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function(str) { // eslint-disable-line no-useless-escape
        return "\\" + str;
      })
        .replace(/\s+/g, function(str) {
          if (str.match(/\xA0/)) {
            if (str.length > 1) {
              return "\\s+";
            } else {
              return "\\s";
            }
          } else {
            return str;
          }
        });
    } else {
      return "label=" + label;
    }
  }

  //BaiMao 
  //DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/07/22
  Recorder.addEventHandler("dragAndDrop", "mousedown", function(event) {
    let self = this;
    if (event.clientX < window.document.documentElement.clientWidth && event.clientY < window.document.documentElement.clientHeight) {
      this.mousedown = event;
      this.mouseup = setTimeout(function() {
        delete self.mousedown;
      }.bind(this), 200);

      this.selectMouseup = setTimeout(function() {
        self.selectMousedown = event;
      }.bind(this), 200);
    }
    this.mouseoverQ = [];

    if (event.target.nodeName) {
      let tagName = event.target.nodeName.toLowerCase();
      if ("option" == tagName) {
        let parent = event.target.parentNode;
        if (parent.multiple) {
          let options = parent.options;
          for (let i = 0; i < options.length; i++) {
            options[i]._wasSelected = options[i].selected;
          }
        }
      }
    }
  }, true);

  //DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/11/01
  Recorder.addEventHandler("dragAndDrop", "mouseup", function(event) {
    clearTimeout(this.selectMouseup);
    function getSelectionText() {
      let text = "";
      let activeEl = window.document.activeElement;
      let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
      if (activeElTagName == "textarea" || activeElTagName == "input") {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
      } else if (window.getSelection) {
        text = window.getSelection().toString();
      }
      return text.trim();
    }

    if (this.selectMousedown) {
      const x = event.clientX - this.selectMousedown.clientX;
      const y = event.clientY - this.selectMousedown.clientY;

      if (this.selectMousedown && event.button === 0 && (x + y) && (event.clientX < window.document.documentElement.clientWidth && event.clientY < window.document.documentElement.clientHeight) && getSelectionText() === "") {
        let sourceRelateX = this.selectMousedown.pageX - this.selectMousedown.target.getBoundingClientRect().left - window.scrollX;
        let sourceRelateY = this.selectMousedown.pageY - this.selectMousedown.target.getBoundingClientRect().top - window.scrollY;
        let targetRelateX, targetRelateY;
        if (!!this.mouseoverQ.length && this.mouseoverQ[1].relatedTarget == this.mouseoverQ[0].target && this.mouseoverQ[0].target == event.target) {
          targetRelateX = event.pageX - this.mouseoverQ[1].target.getBoundingClientRect().left - window.scrollX;
          targetRelateY = event.pageY - this.mouseoverQ[1].target.getBoundingClientRect().top - window.scrollY;

          record("mouseDownAt", locatorBuilders.buildAll(this.selectMousedown.target), sourceRelateX + "," + sourceRelateY);
          record("mouseMoveAt", locatorBuilders.buildAll(this.mouseoverQ[1].target), targetRelateX + "," + targetRelateY);
          record("mouseUpAt", locatorBuilders.buildAll(this.mouseoverQ[1].target), targetRelateX + "," + targetRelateY);
        } else {
          targetRelateX = event.pageX - event.target.getBoundingClientRect().left - window.scrollX;
          targetRelateY = event.pageY - event.target.getBoundingClientRect().top - window.scrollY;

          record("mouseDownAt", locatorBuilders.buildAll(event.target), targetRelateX + "," + targetRelateY);
          record("mouseMoveAt", locatorBuilders.buildAll(event.target), targetRelateX + "," + targetRelateY);
          record("mouseUpAt", locatorBuilders.buildAll(event.target), targetRelateX + "," + targetRelateY);
        }
      }
    } else {
      delete this.clickLocator;
      delete this.mouseup;
      if (this.mousedown) {
        const x = event.clientX - this.mousedown.clientX;
        const y = event.clientY - this.mousedown.clientY;

        if (this.mousedown.target !== event.target && !(x + y)) {
          record("mouseDown", locatorBuilders.buildAll(this.mousedown.target), "");
          record("mouseUp", locatorBuilders.buildAll(event.target), "");
        }
      }
    }
    delete this.mousedown;
    delete this.selectMousedown;
    delete this.mouseoverQ;
  }, true);

  //DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/07/19
  // Record: dragAndDropToObject
  Recorder.addEventHandler("dragAndDropToObject", "dragstart", function(event) {
    let self = this;
    this.dropLocator = setTimeout(function() {
      self.dragstartLocator = event;
    }.bind(this), 200);
  }, true);

  //DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/10/17
  Recorder.addEventHandler("dragAndDropToObject", "drop", function(event) {
    clearTimeout(this.dropLocator);
    if (this.dragstartLocator && event.button == 0 && this.dragstartLocator.target !== event.target) {
      //value no option
      record("dragAndDropToObject", locatorBuilders.buildAll(this.dragstartLocator.target), locatorBuilders.build(event.target));
    }
    delete this.dragstartLocator;
    delete this.selectMousedown;
  }, true);

  //InfluentialScrollingExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/08/02
  let prevTimeOut = null;
  Recorder.addEventHandler("runScript", "scroll", function(event) {
    if (pageLoaded === true) {
      let self = this;
      this.scrollDetector = event.target;
      clearTimeout(prevTimeOut);
      prevTimeOut = setTimeout(function() {
        delete self.scrollDetector;
      }.bind(self), 500);
    }
  }, true);

  //InfluentialMouseoverExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/10/17
  let nowNode = 0;
  const findClickableElement = function(e) {
    if (!e.tagName) return null;
    let tagName = e.tagName.toLowerCase();
    let type = e.type;
    if (e.hasAttribute("onclick") || e.hasAttribute("href") || tagName == "button" ||
      (tagName == "input" &&
        (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox" || type == "reset"))) {
      return e;
    } else {
      if (e.parentNode != null) {
        return findClickableElement(e.parentNode);
      } else {
        return null;
      }
    }
  };

  //Record: mouseOver
  Recorder.addEventHandler("mouseOver", "mouseover", function(event) {
    if (window.document.documentElement)
      nowNode = window.document.documentElement.getElementsByTagName("*").length;
    let self = this;
    if (pageLoaded === true) {
      let clickable = findClickableElement(event.target);
      if (clickable) {
        this.nodeInsertedLocator = event.target;
        setTimeout(function() {
          delete self.nodeInsertedLocator;
        }.bind(self), 500);

        this.nodeAttrChange = locatorBuilders.buildAll(event.target);
        this.nodeAttrChangeTimeout = setTimeout(function() {
          delete self.nodeAttrChange;
        }.bind(self), 10);
      }
      //drop target overlapping
      if (this.mouseoverQ) //mouse keep down
      {
        if (this.mouseoverQ.length >= 3)
          this.mouseoverQ.shift();
        this.mouseoverQ.push(event);
      }
    }
  }, true);

  //InfluentialMouseoverExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/11/08
  // Record: mouseOut
  Recorder.addEventHandler("mouseOut", "mouseout", function(event) {
    if (this.mouseoutLocator !== null && event.target === this.mouseoutLocator) {
      record("mouseOut", locatorBuilders.buildAll(event.target), "");
    }
    delete this.mouseoutLocator;
  }, true);

  // InfluentialMouseoverExt & InfluentialScrollingExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/11/08
  // Record: mouseOver
  Recorder.addEventHandler("mouseOver", "DOMNodeInserted", function() {
    if (pageLoaded === true && window.document.documentElement.getElementsByTagName("*").length > nowNode) {
      let self = this;
      if (this.scrollDetector) {
        //TODO: fix target
        record("runScript", [
          [
            ["window.scrollTo(0," + window.scrollY + ")" ]
          ]
        ], "");
        pageLoaded = false;
        setTimeout(function() {
          pageLoaded = true;
        }.bind(self), 550);
        delete this.scrollDetector;
        delete this.nodeInsertedLocator;
      }
      if (this.nodeInsertedLocator) {
        record("mouseOver", locatorBuilders.buildAll(this.nodeInsertedLocator), "");
        this.mouseoutLocator = this.nodeInsertedLocator;
        delete this.nodeInsertedLocator;
        delete this.mouseoverLocator;
      }
    }
  }, true);

  // InfluentialMouseoverExt & InfluentialScrollingExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/08/02
  let readyTimeOut = null;
  let pageLoaded = true;
  Recorder.addEventHandler("checkPageLoaded", "readystatechange", function() {
    let self = this;
    if (window.document.readyState === "loading") {
      pageLoaded = false;
    } else {
      pageLoaded = false;
      clearTimeout(readyTimeOut);
      readyTimeOut = setTimeout(function() {
        pageLoaded = true;
      }.bind(self), 1500); //setReady after complete 1.5s
    }
  }, true);

  // Record: verify/assert text and title
  Recorder.addEventHandler("contextMenu", "contextmenu", function(event) {
    let myPort = browser.runtime.connect();
    let tmpText = locatorBuilders.buildAll(event.target);
    let tmpVal = getText(event.target);
    let tmpTitle = [
      [normalizeSpaces(event.target.ownerDocument.title)]
    ];
    myPort.onMessage.addListener(function(m) {
      if (m.cmd.includes("Text")) {
        record(m.cmd, tmpText, tmpVal);
      } else if (m.cmd.includes("Title")) {
        record(m.cmd, tmpTitle, "");
      }
      myPort.onMessage.removeListener(this);
    });
  }, true);

  // Record: EditContent
  let getEle;
  let checkFocus = 0;
  let contentTest;
  Recorder.addEventHandler("editContent", "focus", function(event) {
    let editable = event.target.contentEditable;
    if (editable == "true") {
      getEle = event.target;
      contentTest = getEle.innerHTML;
      checkFocus = 1;
    }
  }, true);

  Recorder.addEventHandler("editContent", "blur", function(event) {
    if (checkFocus == 1) {
      if (event.target == getEle) {
        if (getEle.innerHTML != contentTest) {
          record("editContent", locatorBuilders.buildAll(event.target), getEle.innerHTML);
        }
        checkFocus = 0;
      }
    }
  }, true);

  recorder.attach();
}
