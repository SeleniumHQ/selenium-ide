/* coding: utf-8 */

var contentSideexTabId = -1;
var frameLocation = "";

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