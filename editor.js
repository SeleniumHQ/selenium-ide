
/* recording */
var currentRecordingTabId = -1;
var currentRecordingWindowId = -1;
var currentRecordingFrameLocation = "root";
var openedTabNames = new Object();
var openedTabIds = new Object();
var openedTabNamesCount = 1;
/* playing */
var playingFrameLocations = {};
/* flags */
var isRecording = true;
var isPlaying = false;
var windowCreateFlag = false;
var tabCreateFlag = false;

var newWindowInfo = {tabId: undefined, windowId:undefined};

function onConnectError(error) {
    console.log(`Error : ${error}`);
}

browser.tabs.onActivated.addListener(function(windowInfo) {
    if (!isRecording) return;
    setTimeout ( function(windowInfo) {

        console.log("window id = " + windowInfo.windowId + " tab id = " + windowInfo.tabId);
        if (currentRecordingTabId === windowInfo.tabId && currentRecordingWindowId === windowInfo.windowId)
            return;
        currentRecordingTabId = windowInfo.tabId;
        currentRecordingWindowId = windowInfo.windowId;
        currentRecordingFrameLocation = "root";
        if (getRecordsArray().length === 0)
            return;
        /* Tab has existed */
        if (openedTabIds[windowInfo.tabId]) {
            /* check if the stored information is one-to-one mapping */
            /* the target openedTabIds stored may not be correct and need to check before using */
            if (windowInfo.tabId === openedTabNames[openedTabIds[windowInfo.tabId]]) {
                addCommandAuto("selectWindow", [[openedTabIds[windowInfo.tabId]]], "");
                return;
            } else {
                /* reset the value */
                openedTabIds[windowInfo.tabId] = undefined;
            }
        }
        openedTabNames["win_ser_" + openedTabNamesCount] = windowInfo.tabId;
        openedTabIds[windowInfo.tabId] = "win_ser_" + openedTabNamesCount;

        addCommandAuto("selectWindow", [["win_ser_" + openedTabNamesCount]], "");
        openedTabNamesCount++;
    }, 150, windowInfo);
})

browser.windows.onFocusChanged.addListener( function(windowId) {
    if (!isRecording) return;

    if (windowId === browser.windows.WINDOW_ID_NONE) {
        /* 
         *  In Linux, WINDOW_ID_NONE will be sent before switching
         *  See MDN reference for more information
         */
        console.log("Windows onFocusChanged: No window focused");
        return;
    }
    console.log("windows onFocusChanged: currentWindowId: " + windowId);
    if (currentRecordingWindowId === windowId)
        return;
    browser.tabs.query({windowId: windowId, active: true/*, url:"<all_urls>"*/}, function(tabs) {
        
        if(tabs.length === 0 || tabs[0].url.substr(0, 13) == 'moz-extension') {
            console.log("windows onFocusChanged: No matched tabs");
            return;
        }
        if (tabs[0].id !== currentRecordingTabId || tabs[0].windowId !== currentRecordingWindowId) {
            currentRecordingWindowId = windowId;
            currentRecordingTabId = tabs[0].id;
            currentRecordingFrameLocation = "root";
            if (getRecordsArray().length === 0)
                return;
            /* Tab has existed */
            if (openedTabIds[tabs[0].id]) {
                /* check if the stored information is one-to-one mapping */
                /* the target openedTabIds stored may not be correct and need to check before using */
                if (tabs[0].id === openedTabNames[openedTabIds[tabs[0].id]]) {
                    addCommandAuto("selectWindow", [[openedTabIds[tabs[0].id]]], "");
                    return;
                } else {
                    /* reset the value */
                    openedTabIds[tabs[0].id] = undefined;
                }
            }
            openedTabNames["win_ser_" + openedTabNamesCount] = tabs[0].id;
            openedTabIds[tabs[0].id] = "win_ser_" + openedTabNamesCount;
            addCommandAuto("selectWindow", [["win_ser_" + openedTabNamesCount]], "");
            openedTabNamesCount++;
        }
    });
});

browser.tabs.onUpdated.addListener( function(tabId, changeInfo, tabInfo){
    if (isRecording && changeInfo.url) {
        //console.log("tabs updated : reset frame location");
        currentRecordingFrameLocation = "root";
    } 
    // for test
    //if (isRecording && changeInfo.status == "complete") {
        //console.log(tabId + " has complete at" + new Date());
    //}
    if (isPlaying && changeInfo.status == "loading") {
        playingFrameLocations[tabId] = {}; //clear the object
        playingFrameLocations[tabId]["root"] = 0;
        playingFrameLocations[tabId]["status"] = false;
    }

    if (isPlaying && changeInfo.status == "complete") {
        playingFrameLocations[tabId]["status"] = true;
    }
});

function handleMessage(message, sender, sendResponse) {
    if (isPlaying && message.frameLocation) {
        //console.log(sender.frameId);
        if (!playingFrameLocations[sender.tab.id]) {
            playingFrameLocations[sender.tab.id] = {};
            playingFrameLocations[sender.tab.id]["root"] = 0;
        }
        playingFrameLocations[sender.tab.id][message.frameLocation] = sender.frameId;
        return;
    }

    //console.log(sender.tab.id);
    //console.log("QAQ");
    if (!message.command || !isRecording) return;
    if (message.commandSideexTabID != mySideexTabID) return;
    console.error("sender window ID: "+sender.tab.windowId);
    //browser.tabs.query({ currentWindow:true,active:true }, function(tabs){console.log("on command id:"+tabs[0].id);});
    //console.log(message.command);

    if(getRecordsArray().length === 0) {
        openedTabNames["win_ser_local"] = sender.tab.id;
        openedTabIds[sender.tab.id] = "win_ser_local";
        addCommandAuto("open", [[sender.url]], "");
    }
    if (message.frameLocation !== currentRecordingFrameLocation) {
        console.log("Frame location: changed!");
            let newFrameLevels = message.frameLocation.split(':');
            let oldFrameLevels = currentRecordingFrameLocation.split(':');
            while (oldFrameLevels.length > newFrameLevels.length) {
                addCommandAuto("selectFrame", [["relative=parent"]], "");
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length != 0
                    && oldFrameLevels[oldFrameLevels.length - 1] != newFrameLevels[oldFrameLevels.length - 1]) {
                addCommandAuto("selectFrame", [["relative=parent"]], "");
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length < newFrameLevels.length) {
                addCommandAuto("selectFrame", [["index=" + newFrameLevels[oldFrameLevels.length]]], "");
                oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
            }
            currentRecordingFrameLocation = message.frameLocation;
    } else {
        console.log("Frame location: No changed!");
    }

    //Record: doubleClickAt
    if(message.command == "doubleClickAt"){
        var command = getRecordsArray();
        var select = getSelectedRecord();
        var length = (select == "")?getRecordsNum():select.split("-")[1] - 1;
        var equaln = getCommandName(command[length - 1]) == getCommandName(command[length - 2]);
        var equalt = getCommandTarget(command[length - 1]) == getCommandTarget(command[length - 2]);
        var equalv = getCommandValue(command[length - 1]) == getCommandValue(command[length - 2]);
        if(getCommandName(command[length - 1]) == "clickAt" && equaln && equalt && equalv){
            deleteCommand(command[length - 1].id);
            deleteCommand(command[length - 2].id);
            if(select != ""){
                var current = document.getElementById(command[length - 2].id)
                current.className += ' selected';
            }
        }
    } else if(message.command.includes("store")){
        message.value = prompt("Enter the name of the variable");
    }
    addCommandAuto(message.command, message.target, message.value);
    
}

browser.tabs.onRemoved.addListener(function(tabId, removeInfo){
    if (!isRecording) return;

    //if(windowIdArray[removeInfo.windowId] == false)
        //windowIdArray[removeInfo.windowId]=false;

    if (openedTabIds[tabId] && tabId === openedTabNames[openedTabIds[tabId]]) {
        if (currentRecordingTabId !== tabId) {
            addCommandAuto("selectWindow", [[openedTabIds[tabId]]], "");
            addCommandAuto("close", [[openedTabIds[tabId]]], "");
            addCommandAuto("selectWindow", [[openedTabIds[currentRecordingTabId]]]);
        } else {
            addCommandAuto("close", [[openedTabIds[tabId]]], "");
        }     
        delete openedTabNames[openedTabIds[tabId]];
        delete openedTabIds[tabId];
        currentRecordingFrameLocation = "root";
    }

});


browser.runtime.onMessage.addListener(handleMessage);


/* store new window or tab of information when playing */

browser.tabs.onCreated.addListener(function(tab) {
    if (isRecording) return;
    
    if (isPlaying)
        //console.log("new tab");
        tabCreateFlag = true;
});

browser.windows.onCreated.addListener(function(window) {
    if (isRecording) return;

    if (isPlaying)
        windowCreateFlag=true;
});
