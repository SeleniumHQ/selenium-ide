var locatorBuilders = new LocatorBuilders(window);

//Record: ClickAt
var preventClickTwice = false;
window.addEventListener("click", function(event) {
    if (event.button == 0 && !preventClick && event.isTrusted) {
        if (!preventClickTwice) {
            var top = event.pageY,
                left = event.pageX;
            var element = event.target;
            do {
                top -= element.offsetTop;
                left -= element.offsetLeft;
                element = element.offsetParent;
            } while (element);
            var target = event.target;
            record("clickAt", locatorBuilders.buildAll(event.target), left + ',' + top);
            var arrayTest = locatorBuilders.buildAll(event.target);
            preventClickTwice = true;
        }
        setTimeout(function() { preventClickTwice = false; }, 30);
    }
}, true);

//Record: doubleClickAt
window.addEventListener("dblclick", function(event) {

    var top = event.pageY,
        left = event.pageX;
    var element = event.target;
    do {
        top -= element.offsetTop;
        left -= element.offsetLeft;
        element = element.offsetParent;
    } while (element);
    record("doubleClickAt", locatorBuilders.buildAll(event.target), left + ',' + top);
}, true);

//Record: SendKeys
var inputTypes = ["text", "password", "file", "datetime", "datetime-local", "date", "month", "time", "week", "number", "range", "email", "url", "search", "tel", "color"];
var focusTarget = null;
var focusValue = null;
var tempValue = null;
var preventType = false;
var inp = document.getElementsByTagName("input");
for (var i = 0; i < inp.length; i++) {
    if (inputTypes.indexOf(inp[i].type) >= 0) {
        inp[i].addEventListener("focus", function(event) {
            console.log("aa");
            focusTarget = event.target;
            focusValue = focusTarget.value;
            tempValue = focusValue;
            preventType = false;
        });
        inp[i].addEventListener("blur", function(event) {
            console.log("bb");
            focusTarget = null;
            focusValue = null;
            tempValue = null;
        });
    }
}

var preventClick = false;
var enterTarget = null;
var enterValue = null;
var tabCheck = null;
window.addEventListener("keydown", function(event) {

    if (event.target.tagName) {
        var key = event.keyCode;
        var tagName = event.target.tagName.toLowerCase();
        var type = event.target.type;
        if (tagName == 'input' && inputTypes.indexOf(type) >= 0) {
            if (key == 13) {
                enterTarget = event.target;
                enterValue = enterTarget.value;
                var tempTarget = event.target.parentElement;
                var formChk = tempTarget.tagName.toLowerCase();
                //console.log(tempValue + " " + enterTarget.value + " " + tabCheck + " " + enterTarget + " " + focusValue);
                if (tempValue == enterTarget.value && tabCheck == enterTarget) {
                    record("sendKeys", locatorBuilders.buildAll(enterTarget), "${KEY_ENTER}");
                    enterTarget = null;
                    preventType = true;
                } else if (focusValue == enterTarget.value) {
                    while (formChk != 'form' && formChk != 'body') {
                        tempTarget = tempTarget.parentElement;
                        formChk = tempTarget.tagName.toLowerCase();
                    }
                    if (formChk == 'form' && (tempTarget.hasAttribute("id") || tempTarget.hasAttribute("name")) && (!tempTarget.hasAttribute("onsubmit"))) {
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
            var tempbool = false;
            if ((key == 38 || key == 40) && event.target.value != '') {
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
window.addEventListener("change", function(event) {
    if (event.target.tagName && !preventType) {
        var tagName = event.target.tagName.toLowerCase();
        var type = event.target.type;
        if ('input' == tagName && inputTypes.indexOf(type) >= 0) {
            if (event.target.value.length > 0) {
                record("type", locatorBuilders.buildAll(event.target), event.target.value);

                //FormSubmitByEnterKeyExt, Chen-Chieh Ping, SELAB, CSIE, NCKU, 2016/10/07
                if (enterTarget != null) {
                    //FormSubmitByEnterKeyExt & UnnamedWinIFrameExt, Jie-Lin You, SELAB, CSIE, NCKU, 2016/10/18
                    var tempTarget = event.target.parentElement;
                    var formChk = tempTarget.tagName.toLowerCase();
                    while (formChk != 'form' && formChk != 'body') {
                        tempTarget = tempTarget.parentElement;
                        formChk = tempTarget.tagName.toLowerCase();
                    }
                    if (formChk == 'form' && (tempTarget.hasAttribute("id") || tempTarget.hasAttribute("name")) && (!tempTarget.hasAttribute("onsubmit"))) {
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
        } else if ('textarea' == tagName) {
            record("type", locatorBuilders.buildAll(event.target), event.target.value);
        }
    }
});

//select / addSelect / removeSelect
window.addEventListener('focus', function(event) {
    if (event.target.nodeName) {
        var tagName = event.target.nodeName.toLowerCase();
        if ('select' == tagName && event.target.multiple) {
            var options = event.target.options;
            for (var i = 0; i < options.length; i++) {
                if (options[i]._wasSelected == null) {
                    // is the focus was gained by mousedown event, _wasSelected would be already set
                    options[i]._wasSelected = options[i].selected;
                }
            }
        }
    }
}, true);

window.addEventListener('change', function(event) {
    if (event.target.tagName) {
        var tagName = event.target.tagName.toLowerCase();
        if ('select' == tagName) {
            if (!event.target.multiple) {
                var option = event.target.options[event.target.selectedIndex];
                record("select", locatorBuilders.buildAll(event.target), getOptionLocator(option));
            } else {
                var options = event.target.options;
                for (var i = 0; i < options.length; i++) {
                    if (options[i]._wasSelected == null) {}
                    if (options[i]._wasSelected != options[i].selected) {
                        var value = getOptionLocator(options[i]);
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
    var label = option.text.replace(/^ *(.*?) *$/, "$1");
    if (label.match(/\xA0/)) { // if the text contains &nbsp;
        return "label=regexp:" + label.replace(/[\(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function(str) {
                return '\\' + str
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
};

//BaiMao 
//DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/07/22
window.addEventListener('mousedown', function(event) {
    var self = this;
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
        var tagName = event.target.nodeName.toLowerCase();
        if ('option' == tagName) {
            var parent = event.target.parentNode;
            if (parent.multiple) {
                var options = parent.options;
                for (var i = 0; i < options.length; i++) {
                    options[i]._wasSelected = options[i].selected;
                }
            }
        }
    }
}, true);

//DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/11/01
window.addEventListener('mouseup', function(event) {
    clearTimeout(this.selectMouseup);
    if (this.selectMousedown) {
        var x = event.clientX - this.selectMousedown.clientX;
        var y = event.clientY - this.selectMousedown.clientY;

        function getSelectionText() {
            var text = "";
            var activeEl = window.document.activeElement;
            var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
            if (activeElTagName == "textarea" || activeElTagName == "input") {
                text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
            } else if (window.getSelection) {
                text = window.getSelection().toString();
            }
            return text.trim();
        }

        if (this.selectMousedown && event.button === 0 && (x + y) && (event.clientX < window.document.documentElement.clientWidth && event.clientY < window.document.documentElement.clientHeight) && getSelectionText() === '') {
            var sourceRelateX = this.selectMousedown.pageX - this.selectMousedown.target.getBoundingClientRect().left - window.scrollX;
            var sourceRelateY = this.selectMousedown.pageY - this.selectMousedown.target.getBoundingClientRect().top - window.scrollY;
            var targetRelateX, targetRelateY;
            if (!!this.mouseoverQ.length && this.mouseoverQ[1].relatedTarget == this.mouseoverQ[0].target && this.mouseoverQ[0].target == event.target) {
                targetRelateX = event.pageX - this.mouseoverQ[1].target.getBoundingClientRect().left - window.scrollX;
                targetRelateY = event.pageY - this.mouseoverQ[1].target.getBoundingClientRect().top - window.scrollY;
                /*
                browser.runtime.sendMessage({
                    command: "mouseDownAt",
                    target: locatorBuilders.buildAll(this.selectMousedown.target),
                    value: sourceRelateX + ',' + sourceRelateY
                });
                browser.runtime.sendMessage({
                    command: "mouseMoveAt",
                    target: locatorBuilders.buildAll(this.mouseoverQ[1].target),
                    value: targetRelateX + ',' + targetRelateY
                });
                browser.runtime.sendMessage({
                    command: "mouseUpAt",
                    target: locatorBuilders.buildAll(this.mouseoverQ[1].target),
                    value: targetRelateX + ',' + targetRelateY
                });*/
                record("mouseDownAt", locatorBuilders.buildAll(this.selectMousedown.target), sourceRelateX + ',' + sourceRelateY);
                record("mouseMoveAt", locatorBuilders.buildAll(this.mouseoverQ[1].target), targetRelateX + ',' + targetRelateY);
                record("mouseUpAt", locatorBuilders.buildAll(this.mouseoverQ[1].target), targetRelateX + ',' + targetRelateY);
            } else {
                targetRelateX = event.pageX - event.target.getBoundingClientRect().left - window.scrollX;
                targetRelateY = event.pageY - event.target.getBoundingClientRect().top - window.scrollY;
                /*
                browser.runtime.sendMessage({
                    command: "mouseDownAt",
                    target: locatorBuilders.buildAll(this.selectMousedown.target),
                    value: sourceRelateX + ',' + sourceRelateY
                });
                browser.runtime.sendMessage({
                    command: "mouseMoveAt",
                    target: locatorBuilders.buildAll(event.target),
                    value: targetRelateX + ',' + targetRelateY
                });
                browser.runtime.sendMessage({
                    command: "mouseUpAt",
                    target: locatorBuilders.buildAll(event.target),
                    value: targetRelateX + ',' + targetRelateY
                });
                */
                record("mouseDownAt", locatorBuilders.buildAll(event.target), targetRelateX + ',' + targetRelateY);
                record("mouseMoveAt", locatorBuilders.buildAll(event.target), targetRelateX + ',' + targetRelateY);
                record("mouseUpAt", locatorBuilders.buildAll(event.target), targetRelateX + ',' + targetRelateY);
            }
        }
    } else {
        delete this.clickLocator;
        delete this.mouseup;
        var x = event.clientX - this.mousedown.clientX;
        var y = event.clientY - this.mousedown.clientY;

        if (this.mousedown && this.mousedown.target !== event.target && !(x + y)) {
            /*
              browser.runtime.sendMessage({
                  command: "mouseDown",
                  target: locatorBuilders.buildAll(this.mousedown.target),
                  value: ''
              });
              browser.runtime.sendMessage({
                  command: "mouseUp",
                  target: locatorBuilders.buildAll(event.target),
                  value: ''
              });
              */
            record("mouseDown", locatorBuilders.buildAll(this.mousedown.target), '');
            record("mouseUp", locatorBuilders.buildAll(event.target), '');
        } else if (this.mousedown && this.mousedown.target === event.target) {
            var self = this;
            var target = locatorBuilders.buildAll(this.mousedown.target);
            // setTimeout(function() {
            //     if (!self.clickLocator)
            //         record("click", target, '');
            // }.bind(this), 100);
        }

    }
    delete this.mousedown;
    delete this.selectMousedown;
    delete this.mouseoverQ;

}, true);

//DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/07/19
window.addEventListener('dragstart', function(event) {
    var self = this;
    this.dropLocator = setTimeout(function() {
        self.dragstartLocator = event;
    }.bind(this), 200);
}, true);

//DragAndDropExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/10/17
window.addEventListener('drop', function(event) {
    clearTimeout(this.dropLocator);
    if (this.dragstartLocator && event.button == 0 && this.dragstartLocator.target !== event.target) {
        //value no option
        /*
        browser.runtime.sendMessage({
            command: "dragAndDropToObject",
            target: locatorBuilders.buildAll(this.dragstartLocator.target),
            value: locatorBuilders.build(event.target)
        });
        */
        record("dragAndDropToObject", locatorBuilders.buildAll(this.dragstartLocator.target), locatorBuilders.build(event.target));
    }
    delete this.dragstartLocator;
    delete this.selectMousedown;
}, true);

//InfluentialScrollingExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/08/02
var prevTimeOut = null;
window.addEventListener('scroll', function(event) {
    if (pageLoaded === true) {
        var self = this;
        this.scrollDetector = event.target;
        clearTimeout(prevTimeOut);
        prevTimeOut = setTimeout(function() {
            delete self.scrollDetector;
        }.bind(self), 500);
    }
}, true);

//InfluentialMouseoverExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/10/17
var nowNode = 0;
var findClickableElement = function(e) {
    if (!e.tagName) return null;
    var tagName = e.tagName.toLowerCase();
    var type = e.type;
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

window.addEventListener('mouseover', function(event) {
    if (window.document.documentElement)
        nowNode = window.document.documentElement.getElementsByTagName('*').length;
    var self = this;
    if (pageLoaded === true) {
        var clickable = findClickableElement(event.target);
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
window.addEventListener('mouseout', function(event) {
    if (this.mouseoutLocator !== null && event.target === this.mouseoutLocator) {
        /*
        browser.runtime.sendMessage({
            command: "mouseOut",
            target: locatorBuilders.buildAll(event.target),
            value: ''
        });
        */
        record("mouseOut", locatorBuilders.buildAll(event.target), '');
    }
    delete this.mouseoutLocator;
}, true);

// InfluentialMouseoverExt & InfluentialScrollingExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/11/08
window.addEventListener('DOMNodeInserted', function(event) {
    if (pageLoaded === true && window.document.documentElement.getElementsByTagName('*').length > nowNode) {
        var self = this;
        if (this.scrollDetector) {
            //TODO: fix target
            /*
            browser.runtime.sendMessage({
                command: "runScript",
                target: [["window.scrollTo(0," + window.scrollY + ")",]],
                value: ''
            });
            */
            record("runScript", [
                [
                    ["window.scrollTo(0," + window.scrollY + ")", ]
                ]
            ], '');
            pageLoaded = false;
            setTimeout(function() {
                pageLoaded = true;
            }.bind(self), 550);
            delete this.scrollDetector;
            delete this.nodeInsertedLocator;
        }
        if (this.nodeInsertedLocator) {
            /*
            browser.runtime.sendMessage({
                command: "mouseOver",
                target: locatorBuilders.buildAll(this.nodeInsertedLocator),
                value: ''
            });
            */
            record("mouseOver", locatorBuilders.buildAll(this.nodeInsertedLocator), '');
            this.mouseoutLocator = this.nodeInsertedLocator;
            delete this.nodeInsertedLocator;
            delete this.mouseoverLocator;
        }
    }
}, true);

// InfluentialMouseoverExt & InfluentialScrollingExt, Shuo-Heng Shih, SELAB, CSIE, NCKU, 2016/08/02
var readyTimeOut = null;
var pageLoaded = true;
window.addEventListener('readystatechange', function(event) {
    var self = this;
    if (window.document.readyState === 'loading') {
        pageLoaded = false;
    } else {
        pageLoaded = false;
        clearTimeout(readyTimeOut);
        readyTimeOut = setTimeout(function() {
            pageLoaded = true;
        }.bind(self), 1500); //setReady after complete 1.5s
    }
}, true);

// verify/assert text and title
window.addEventListener('contextmenu', function(event) {
    //     //window.console.log(locatorBuilders.buildAll(event.target));
    //     //browser.runtime.connect().postMessage({T:locatorBuilders.buildAll(event.target),V:event.target.textContent});
    //     // record("verifyText", locatorBuilders.buildAll(event.target), event.target.textContent);
    var myPort = browser.runtime.connect();
    var tmpText = locatorBuilders.buildAll(event.target);
    var tmpVal = event.target.textContent;
    var tmpTitle = [
        [event.target.ownerDocument.title]
    ];
    myPort.onMessage.addListener(function(m) {
        if (m.cmd.includes("Text")) {
            record(m.cmd, tmpText, tmpVal);
        } else if (m.cmd.includes("Title")) {
            record(m.cmd, tmpTitle, '');
        }
        this.removeListener();
    });
}, true);

//EditContentExt
var getEle;
var checkFocus = 0;
window.addEventListener('focus', function(event) {
    var editable = event.target.contentEditable;
    if (editable == 'true') {
        getEle = event.target;
        contentTest = getEle.innerHTML;
        checkFocus = 1;
    }
}, true);

window.addEventListener('blur', function(event) {
    if (checkFocus == 1) {
        if (event.target == getEle) {
            if (getEle.innerHTML != contentTest) {
                record("editContent", locatorBuilders.buildAll(event.target), getEle.innerHTML);
            }
            checkFocus = 0;
        }
    }
}, true);
