/* coding: utf-8 */

var contentSideexTabID = -1;
var frameLocation = "";

/* set sideex window id ====================*/
//set temp_pageSideexTabId on DOM
document.body.setAttribute("temp_pageSideexTabID", contentSideexTabID);

/* a export function pass contentSideexTabID from content script to page script
function getSideexTabID(){
    var pageSideexTabID = contentSideexTabID;
    return pageSideexTabID;
}
exportFunction(getSideexTabID,window,{defineAs:'getSideexTabID'});
*/

// the child window will do 
try{
    if (window.opener != null) {
        /* just can use in FireFox
        contentSideexTabID = window.opener.wrappedJSObject.getSideexTabID();
        XPCNativeWrapper(window.opener.wrappedJSObject.getSideexTabID());
        console.error("contentSideexTabID: "+contentSideexTabID);
        */

        //use set attribute
        contentSideexTabID = window.opener.document.body.getAttribute("temp_pageSideexTabID");
        document.body.setAttribute("temp_pageSideexTabID", contentSideexTabID);
        browser.runtime.sendMessage({ newWindow: "true", commandSideexTabID: contentSideexTabID });
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
    contentSideexTabID = message.mySideexTabID;
    document.body.setAttribute("temp_pageSideexTabID", contentSideexTabID);
}
/* ================================================= */

// show element
function startShowElement(message, sender, sendResponse){
    if (message.mySideexTabID == contentSideexTabID && message.showElement){
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({result: result});
    }
}
browser.runtime.onMessage.addListener(startShowElement);

// initial the siddeX tab ID in content
browser.runtime.onMessage.addListener(function(message) {
    if (message.sideexID) {
        contentSideexTabID = message.sideexID;
        console.log("sideeX id:" + contentSideexTabID);

        //open sideex update sideexTabID
        document.body.setAttribute("temp_pageSideexTabID", message.sideexID);
        console.log("temp_pageSideexTabID: " + document.body.getAttribute("temp_pageSideexTabID"));
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
        commandSideexTabID: contentSideexTabID
    });
}

function onError(error) {
    alert(`Error: ${error}`);
};