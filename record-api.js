/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var contentSideexTabId = -1;
var frameLocation = "";

function Recorder(window) {
    this.window = window;
    this.attach();
    this.dettach();
}

Recorder.eventHandlers = {};
Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
    handler.handlerName = handlerName;
    if (!options) options = false;
    let key = options ? ('C_' + eventName) : eventName;
    if (!this.eventHandlers[key]) {
        this.eventHandlers[key] = [];
    }
    this.eventHandlers[key].push(handler);
}

Recorder.prototype.attach = function() {

}

// show element
function startShowElement(message, sender, sendResponse){
    if (message.showElement) {
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({result: result});
    }
}
browser.runtime.onMessage.addListener(startShowElement);

// set frame id
(function getframeLocation() {
    let currentWindow = window;
    let currentParentWindow;
    while (currentWindow !== window.top) {
        currentParentWindow = currentWindow.parent;
        for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
            if (currentParentWindow.frames[idx] === currentWindow) {
                frameLocation = ":" + idx + frameLocation;
                currentWindow = currentParentWindow;
                break;
            }
    }
    frameLocation = "root" + frameLocation;
})();
console.log("frameLocation : " + frameLocation);
browser.runtime.sendMessage({ frameLocation: frameLocation });

/* record */
function record(command, target, value, insertBeforeLastCommand) {
    browser.runtime.sendMessage({
        command: command,
        target: target,
        value: value,
        insertBeforeLastCommand: insertBeforeLastCommand,
        frameLocation: frameLocation,
        commandSideexTabId: contentSideexTabId
    });
}

function onError(error) {
    alert(`Error: ${error}`);
};