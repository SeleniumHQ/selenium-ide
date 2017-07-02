/*var contentRecord = -1;*/
var contentRecord = 1;
var contentSideexTabID = -1;
var locatorBuilders = new LocatorBuilders(window);

var frameLocation = "";

//set temp_pageSideexTabId on DOM
console.log("in set attribute 1");
document.body.setAttribute("temp_pageSideexTabID",contentSideexTabID);

/*a export function pass contentSideexTabID from content script to page script
function getSideexTabID(){
    var pageSideexTabID = contentSideexTabID;
    return pageSideexTabID;
}
exportFunction(getSideexTabID,window,{defineAs:'getSideexTabID'});
*/
//the child window will do 
//console.error("opener id: "+window.opener);
console.log("window opener: "+window.opener);
if (window.opener != null) {
    /* just can use in FireFox
    contentSideexTabID = window.opener.wrappedJSObject.getSideexTabID();
    XPCNativeWrapper(window.opener.wrappedJSObject.getSideexTabID());
    console.error("contentSideexTabID: "+contentSideexTabID);
    */

    //use set attribute
    contentSideexTabID = window.opener.document.body.getAttribute("temp_pageSideexTabID");
    console.log("contentSideexTabID: "+contentSideexTabID);
    console.log("in set attribute 2");
    document.body.setAttribute("temp_pageSideexTabID",contentSideexTabID);

    browser.runtime.sendMessage({newWindow:"true",commandSideexTabID:contentSideexTabID});
} else {
    //when change page
    console.log("test1");
    var changePage2 = browser.runtime.sendMessage({changePage:true});
    console.log("test2");
    changePage2.then(handleChangePageResponse).catch(function(reason){console.log(reason);});
}
function handleChangePageResponse(message) {
    console.log("response sideex id: "+message.mySideexTabID);
    contentSideexTabID = message.mySideexTabID;
    console.log("contentSideexTabId: " + contentSideexTabID);
    console.log("in set attribute 3");
    document.body.setAttribute("temp_pageSideexTabID",contentSideexTabID);
    console.log("change contentSideexTabId: " + contentSideexTabID);
}


//Record: ClickAt
var preventClickTwice = false;
window.addEventListener("click", function(event) {

    if (event.button == 0 && !preventClick && event.isTrusted) {
        if (!preventClickTwice){
            var top = event.pageY,
                left = event.pageX;
            var element = event.target;
            do {
                top -= element.offsetTop;
                left -= element.offsetLeft;
                element = element.offsetParent;
            } while (element);
            var target = event.target;
            //console.log("here id:"+contentSideexTabID);
            //browser.runtime.sendMessage(.....);
            record("clickAt", locatorBuilders.buildAll(event.target), left + ',' + top);
            //console.log("2here id:"+contentSideexTabID);
            var arrayTest = locatorBuilders.buildAll(event.target);
            //console.error(arrayTest[0][0]+"-"+arrayTest[0][1]+"-"+arrayTest[1][0]+"-"+arrayTest[1][1]);
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
for(var i = 0; i < inp.length; i++){
    if(inputTypes.indexOf(inp[i].type) >= 0){
        inp[i].addEventListener("focus", function(event){
            console.log("aa");
            focusTarget = event.target;
            focusValue = focusTarget.value;
            tempValue = focusValue;
            preventType = false;
        });
        inp[i].addEventListener("blur", function(event){
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
                //this.callIfMeaningfulEvent(function() {
                    if (tempbool) {
                        record("type", locatorBuilders.buildAll(event.target), tempValue);
                    }

                    setTimeout(function() {
                        tempValue = focusTarget.value;
                    }, 250);

                    if (key == 38) record("sendKeys", locatorBuilders.buildAll(event.target), "${KEY_UP}");
                    else record("sendKeys", locatorBuilders.buildAll(event.target), "${KEY_DOWN}");

                    tabCheck = event.target;
                //});
            }
            if (key == 9) {
                if (tabCheck == event.target) {
                    //this.callIfMeaningfulEvent(function() {
                        record("sendKeys", locatorBuilders.buildAll(event.target), "${KEY_TAB}");

                        preventType = true;
                    //});
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
                            record("submit", [["id=" + tempTarget.id, "id"]], "");
                        else if (tempTarget.hasAttribute("name")) 
                            record("submit", [["name=" + tempTarget.name, "name"]] , "");
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


//initial the siddeX tab ID in content
browser.runtime.onMessage.addListener(function(message) {
    if(message.sideexID){
        contentSideexTabID = message.sideexID;
        console.log("sideeX id:"+contentSideexTabID);

        //open sideex update sideexTabID
        console.log("in set attribute 4");
        document.body.setAttribute("temp_pageSideexTabID",message.sideexID);
        console.log("temp_pageSideexTabID: "+document.body.getAttribute("temp_pageSideexTabID"));
    }
});

function onError(error) {
    alert(`Error: ${error}`);
};

//console.log("frameLocation : " + frameLocation);

(function getframeLocation() {
    let currentWindow = window;
    let currentParentWindow;
    while(currentWindow !== window.top) {
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
/* playback */
browser.runtime.sendMessage({frameLocation: frameLocation});

/* record */
function record(command, target, value) {
    browser.runtime.sendMessage({
        command: command,
        target: target,
        value: value,
        frameLocation: frameLocation,
        commandSideexTabID:contentSideexTabID
    });
}


/* for test */
/*
if(window.frameElement){
    if(window.frameElement.getAttribute("name"))
        console.log("Name: " + window.frameElement.getAttribute("name"));
    if(window.frameElement.getAttribute("id"))
        console.log("Id: " + window.frameElement.getAttribute("id"));
}
*/

/* for test */
//console.log("complete at " + new Date());