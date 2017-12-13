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

/* recording */
var currentRecordingTabId = -1;
var currentRecordingWindowId = -1;
var currentRecordingFrameLocation = "root";
var openedTabNames = new Object();
var openedTabIds = new Object();
var openedWindowIds = new Object();
var openedTabCount = 1;
var selfWindowId = -1;
var contentWindowId;
var notificationCount = 0;

/* playing */
var playingFrameLocations = {};
/* flags */
var isRecording = false;
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
        return;
    }
    // If the activated window is the same as the last, just do nothing
    // selectWindow command will be handled by tabs.onActivated listener
    // if there also has a event of switching a activated tab
    if (currentRecordingWindowId === windowId)
        return;
    browser.tabs.query({windowId: windowId, active: true})
    .then(function(tabs) {
        if(tabs.length === 0 || tabs[0].url.substr(0, 13) == 'moz-extension'
            || tabs[0].url.substr(0, 16) == 'chrome-extension') {
            return;
        }
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
        extCommand.setLoading(tabId);
    }

    if (isPlaying && changeInfo.status == "complete") {
        extCommand.setComplete(tabId);
    }
});

function handleMessage(message, sender, sendResponse) {
    if (message.selectTarget) {
        window.selectTarget(message.target);
    }
    if (message.cancelSelectTarget) {
        window.endSelection(sender.tab.id);
    }

    if (isPlaying && message.frameLocation) {
        extCommand.setFrame(sender.tab.id, message.frameLocation, sender.frameId);
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
            [sender.tab.url]
        ], "");
    }

    if (!openedTabIds[sender.tab.id])
        return;

    if (message.frameLocation !== currentRecordingFrameLocation) {
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
        // In Google Chrome, window.prompt() must be triggered in
        // an actived tabs of front window, so we let panel window been focused
        browser.windows.update(selfWindowId, {focused: true})
        .then(function() {
            // Even if window has been focused, window.prompt() still failed.
            // Delay a little time to ensure that status has been updated 
            setTimeout(function() {
                message.value = prompt("Enter the name of the variable");
                if (message.insertBeforeLastCommand) {
                    addCommandBeforeLastCommand(message.command, message.target, message.value);
                } else {
                    notification(message.command, message.target, message.value);
                    addCommandAuto(message.command, message.target, message.value);
                }
            }, 100);
        })
        return;
    }
    
    //handle choose ok/cancel confirm
    if (message.insertBeforeLastCommand) {
        addCommandBeforeLastCommand(message.command, message.target, message.value);
    } else {
        notification(message.command, message.target, message.value);
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
    if (isPlaying && extCommand.hasTab(details.sourceTabId))
        extCommand.setNewTab(details.tabId);
});

browser.runtime.onMessage.addListener(function contentWindowIdListener(message) {
    if (message.selfWindowId != undefined && message.commWindowId != undefined) {
        selfWindowId = message.selfWindowId;
        contentWindowId = message.commWindowId;
        extCommand.setContentWindowId(contentWindowId);
        openedWindowIds[message.commWindowId] = true;
        browser.runtime.onMessage.removeListener(contentWindowIdListener);
    }
})

function notification(command, target, value) {
    let tempCount = String(notificationCount);
    notificationCount++;
    // In Chrome, notification.create must have "iconUrl" key in notificationOptions
    browser.notifications.create(tempCount, {
        "type": "basic",
        "iconUrl": "/icons/icon128.png",
        "title": "Record command!",
        "message": "command: " + String(command) + "\ntarget: " + String(target[0][0]) + "\nvalue: " + String(value) 
    });

    setTimeout(function() {
        browser.notifications.clear(tempCount);
    }, 1500);
}
