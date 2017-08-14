/* recording */
var currentRecordingTabId = -1;
var currentRecordingWindowId = -1;
var currentRecordingFrameLocation = "root";
var openedTabNames = new Object();
var openedTabIds = new Object();
var openedWindowIds = new Object();
var openedTabCount = 1;
var selfTabId = -1;
var contentWindowId;

/* playing */
var playingFrameLocations = {};
/* flags */
var isRecording = true;
var isPlaying = false;
var recordEnable = false;
var windowCreateFlag = false;
var tabCreateFlag = false;

var newWindowInfo = { tabId: undefined, windowId: undefined };

function onConnectError(error) {
    console.log(`Error : ${error}`);
}

function setRecordEnable(vlaue){
    recordEnable = value;
}

browser.tabs.onActivated.addListener(function(activeInfo) {

    if (!isRecording) return;
    // TODO: block of setTimeout() should only enclose addCommand
    setTimeout(function(activeInfo) {
        console.log("window id = " + activeInfo.windowId + " tab id = " + activeInfo.tabId);
        if (currentRecordingTabId === activeInfo.tabId && currentRecordingWindowId === activeInfo.windowId)
            return;
        // If no command has been recorded, ignore selectWindow command
        // until the user has select a starting page to record the commands
        if (getRecordsArray().length === 0)
            return;
        // Ignore all unknown tabs, the activated tab may not derived from
        // other opened tabs, or it may managed by other SideeX panels
        if (!openedTabIds[activeInfo.tabId])
            return;
        // Tab information has existed, add selectWindow command
        currentRecordingTabId = activeInfo.tabId;
        currentRecordingWindowId = activeInfo.windowId;
        currentRecordingFrameLocation = "root";
        addCommandAuto("selectWindow", [[openedTabIds[activeInfo.tabId]]], "");
    }, 150, activeInfo);
})

browser.windows.onFocusChanged.addListener( function(windowId) {

    if (!isRecording) return;

    if (windowId === browser.windows.WINDOW_ID_NONE) {
        // In some Linux window managers, WINDOW_ID_NONE will be listened before switching
        // See MDN reference :
        // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows/onFocusChanged
        console.log("Windows onFocusChanged: No window focused");
        return;
    }
    console.log("windows onFocusChanged: currentWindowId: " + windowId);
    // If the activated window is the same as the last, just do nothing
    // selectWindow command will be handled by tabs.onActivated listener
    // if there also has a event of switching a activated tab
    if (currentRecordingWindowId === windowId)
        return;
    browser.tabs.query({windowId: windowId, active: true})
    .then(function(tabs) {
        if(tabs.length === 0 || tabs[0].url.substr(0, 13) == 'moz-extension'
            || tabs[0].url.substr(0, 16) == 'chrome-extension') {
            console.log("windows onFocusChanged: No matched tabs");
            return;
        }
        console.log(tabs[0].id);
        console.log(tabs[0].url);
        // The activated tab is not the same as the last
        if (tabs[0].id !== currentRecordingTabId) {
            
            // If no command has been recorded, ignore selectWindow command
            // until the user has select a starting page to record commands
            if (getRecordsArray().length === 0)
                return;
            // Ignore all unknown tabs, the activated tab may not derived from
            // other opened tabs, or it may managed by other SideeX panels
            if (!openedTabIds[tabs[0].id])
                return;
            // Tab information has existed, add selectWindow command
            currentRecordingWindowId = windowId;
            currentRecordingTabId = tabs[0].id;
            currentRecordingFrameLocation = "root";
            addCommandAuto("selectWindow", [[openedTabIds[tabs[0].id]]], "");
        }
    });
});

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    if (isRecording && changeInfo.url) {
        currentRecordingFrameLocation = "root";
    }
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
    if (message.selectTarget) {
        console.log(message.target);
        return;
    }
    if (message.cancelSelectTarget) {
        var button = document.getElementById("select");
        isSelecting = false; 
        button.value = "Select";
        browser.tabs.sendMessage(sender.tab.id, {selectMode: true, selecting: false});
        return;
    }

    if (isPlaying && message.frameLocation) {
        if (!playingFrameLocations[sender.tab.id]) {
            playingFrameLocations[sender.tab.id] = {};
            playingFrameLocations[sender.tab.id]["root"] = 0;
        }
        playingFrameLocations[sender.tab.id][message.frameLocation] = sender.frameId;
        return;
    }


    if (!message.command || !isRecording) return;
    if (!openedWindowIds[sender.tab.windowId])
        return;

    if (getRecordsArray().length === 0) {
        currentRecordingTabId = sender.tab.id;
        currentRecordingWindowId = sender.tab.windowId;
        openedTabNames["win_ser_local"] = sender.tab.id;
        openedTabIds[sender.tab.id] = "win_ser_local";
        addCommandAuto("open", [
            [sender.url]
        ], "");
    }

    if (!openedTabIds[sender.tab.id])
        return;

    if (message.frameLocation !== currentRecordingFrameLocation) {
        console.log("Frame location: changed!");
        let newFrameLevels = message.frameLocation.split(':');
        let oldFrameLevels = currentRecordingFrameLocation.split(':');
        while (oldFrameLevels.length > newFrameLevels.length) {
            addCommandAuto("selectFrame", [
                ["relative=parent"]
            ], "");
            oldFrameLevels.pop();
        }
        while (oldFrameLevels.length != 0 && oldFrameLevels[oldFrameLevels.length - 1] != newFrameLevels[oldFrameLevels.length - 1]) {
            addCommandAuto("selectFrame", [
                ["relative=parent"]
            ], "");
            oldFrameLevels.pop();
        }
        while (oldFrameLevels.length < newFrameLevels.length) {
            addCommandAuto("selectFrame", [
                ["index=" + newFrameLevels[oldFrameLevels.length]]
            ], "");
            oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
        }
        currentRecordingFrameLocation = message.frameLocation;
    } else {
        console.log("Frame location: No changed!");
    }

    //Record: doubleClickAt
    if (message.command == "doubleClickAt") {
        var command = getRecordsArray();
        var select = getSelectedRecord();
        var length = (select == "") ? getRecordsNum() : select.split("-")[1] - 1;
        var equaln = getCommandName(command[length - 1]) == getCommandName(command[length - 2]);
        var equalt = getCommandTarget(command[length - 1]) == getCommandTarget(command[length - 2]);
        var equalv = getCommandValue(command[length - 1]) == getCommandValue(command[length - 2]);
        if (getCommandName(command[length - 1]) == "clickAt" && equaln && equalt && equalv) {
            deleteCommand(command[length - 1].id);
            deleteCommand(command[length - 2].id);
            if (select != "") {
                var current = document.getElementById(command[length - 2].id)
                current.className += ' selected';
            }
        }
    } else if (message.command.includes("store")) {
        message.value = prompt("Enter the name of the variable");
    }
    
    //handle choose ok/cancel confirm
    if (message.insertBeforeLastCommand) {
        addCommandBeforeLastCommand(message.command, message.target, message.value);
    } else {    
        addCommandAuto(message.command, message.target, message.value);
    }
}

browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (!isRecording) return;

    if (openedTabIds[tabId] && tabId === openedTabNames[openedTabIds[tabId]]) {
        if (currentRecordingTabId !== tabId) {
            addCommandAuto("selectWindow", [
                [openedTabIds[tabId]]
            ], "");
            addCommandAuto("close", [
                [openedTabIds[tabId]]
            ], "");
            addCommandAuto("selectWindow", [
                [openedTabIds[currentRecordingTabId]]
            ]);
        } else {
            addCommandAuto("close", [
                [openedTabIds[tabId]]
            ], "");
        }
        delete openedTabNames[openedTabIds[tabId]];
        delete openedTabIds[tabId];
        currentRecordingFrameLocation = "root";
    }

});


browser.runtime.onMessage.addListener(handleMessage);

browser.webNavigation.onCreatedNavigationTarget.addListener(function(details) {
    if (isRecording && openedTabIds[details.sourceTabId]) {
        openedTabNames["win_ser_" + openedTabCount] = details.tabId;
        openedTabIds[details.tabId] = "win_ser_" + openedTabCount;
        openedWindowIds[details.windowId] = true;
        openedTabCount++;
    }
    if (isPlaying && playingTabIds[details.sourceTabId]) {
        console.log("select a new window!!");
        playingTabNames["win_ser_" + playingTabCount] = details.tabId;
        playingTabIds[details.tabId] = "win_ser_" + playingTabCount;
        playingTabCount++;
    }
});

browser.runtime.onMessage.addListener(function contentWindowIdListener(message) {
    if (message.selfTabId != undefined && message.commWindowId != undefined) {
        selfTabId = message.selfTabId;
        contentWindowId = message.commWindowId;
        console.log(selfTabId);
        console.log(contentWindowId);
        openedWindowIds[contentWindowId] = true;
        browser.runtime.onMessage.removeListener(contentWindowIdListener);
    }
})