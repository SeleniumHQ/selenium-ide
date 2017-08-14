/* coding: utf-8 */

var contentSideexTabId = -1;
var frameLocation = "";

/* set sideex window id ====================*/
//set temp_pageSideexTabId on DOM
document.body.setAttribute("temp_pageSideexTabId", contentSideexTabId);

/* a export function pass contentSideexTabId from content script to page script
function getSideexTabId(){
    var pageSideexTabId = contentSideexTabId;
    return pageSideexTabId;
}
exportFunction(getSideexTabId,window,{defineAs:'getSideexTabId'});
*/

// the child window will do 
try{
    if (window.opener != null) {
        /* just can use in FireFox
        contentSideexTabId = window.opener.wrappedJSObject.getSideexTabId();
        XPCNativeWrapper(window.opener.wrappedJSObject.getSideexTabId());
        console.error("contentSideexTabId: "+contentSideexTabId);
        */

        //use set attribute
        contentSideexTabId = window.opener.document.body.getAttribute("temp_pageSideexTabId");
        document.body.setAttribute("temp_pageSideexTabId", contentSideexTabId);
        browser.runtime.sendMessage({ newWindow: "true", commandSideexTabId: contentSideexTabId });
    } else {
        //when change page
        var changePage2 = browser.runtime.sendMessage({ changePage: true });
        changePage2.then(handleChangePageResponse).catch(function(reason) { console.log(reason); });
    }
} catch (e){
    //when change page
    var changePage2 = browser.runtime.sendMessage({changePage:true});
    changePage2.then(handleChangePageResponse);
}
function handleChangePageResponse(message) {
    contentSideexTabId = message.mySideexTabId;
    document.body.setAttribute("temp_pageSideexTabId", contentSideexTabId);
}
/* ================================================= */

// show element
function startShowElement(message, sender, sendResponse){
    if (message.mySideexTabId == contentSideexTabId && message.showElement){
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({result: result});
    }
}
browser.runtime.onMessage.addListener(startShowElement);

// initial the siddeX tab Id in content
browser.runtime.onMessage.addListener(function(message) {
    if (message.sideexId) {
        contentSideexTabId = message.sideexId;
        console.log("sideeX id:" + contentSideexTabId);

        //open sideex update sideexTabId
        document.body.setAttribute("temp_pageSideexTabId", message.sideexId);
        console.log("temp_pageSideexTabId: " + document.body.getAttribute("temp_pageSideexTabId"));
    }
});


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