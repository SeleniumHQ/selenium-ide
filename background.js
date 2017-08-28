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

var panelId = undefined;
var windowOpenSideex = new Object();

function onCreated(windowInfo) {
    console.log(`Create editor successfully: id = ${windowInfo.id}`);
    panelId = windowInfo.id;
}

function onError(error) {
    console.log(`Error: ${error}`);
}

/*
function getContentWindowInfo() {
    let contentWindowInfo = browser.windows.getLastFocused();
    //contentWindowInfo.then(function(info) {console.log("contentWindowInfo1: ", Info.tabs);});
    return contentWindowInfo;
}
//*/
function checkOpenOneSideex(contentWindowInfo) {
    console.log("contentWindowInfo1-2: ", contentWindowInfo);
    if (windowOpenSideex[contentWindowInfo.id] !== undefined && windowOpenSideex[contentWindowInfo.id] == true) {
        console.log("Sideex has been opened.");
        console.log("windowOpenSideex: ", windowOpenSideex);
        return Promise.reject("Sideex has been opened.");
    }
    windowOpenSideex[contentWindowInfo.id] = true;
    console.log("Open one sideex.")
    console.log("contentWindowInfo2: ", contentWindowInfo);
    return contentWindowInfo;
}

function openSideexWindow(contentWindowInfo) {
    let sideexWindowInfo = browser.windows.create({
        url: browser.extension.getURL("panel.html"),
        type: "popup",
        height: 730,
        width: 700
    });
    console.log("contentWindowInfo3: ", contentWindowInfo);
    console.log("sideexWindowInfo: ", sideexWindowInfo);
    //return [contentWindowInfo, Promise.resolve(sideexWindowInfo)];
    return sideexWindowInfo;
}

function openPage() {

    ///*
    var getContentWindowInfo = browser.windows.getLastFocused();
    var getSideexWindowInfo = browser.windows.create({
        url: browser.extension.getURL("panel.html"),
        type: "popup",
        height: 730,
        width: 700
    });

    Promise.all([getContentWindowInfo, getSideexWindowInfo])
    .then(function(windowInfo) {
        console.log("get the window info")
        let contentWindowInfo = windowInfo[0];
        let sideexWindowInfo = windowInfo[1];
        console.log("contentWindowInfo Id:" + contentWindowInfo.id);
        console.log("contentWindowInfo:", contentWindowInfo);
        console.log("sideexWindowInfo Id:" + sideexWindowInfo.id);
        console.log("sideexWindowInfo:", sideexWindowInfo);
        return new Promise(function(resolve, reject) {
            let count = 0;
            let interval = setInterval(function() {
                if (count > 100) {
                    reject("SideeX editor has no response");
                    clearInterval(interval);
                }

                browser.tabs.query({
                    active: true,
                    windowId: sideexWindowInfo.id
                }).then(function(tabs) {
                    if (tabs.length != 1) {
                        count++;
                        return;
                    }
                    let sideexTabInfo = tabs[0];
                    if (sideexTabInfo.status == "loading") {
                        count++;
                        return;
                    } else {
                        console.log("SideeX has been fully loaded")
                        resolve(windowInfo);
                        clearInterval(interval);
                    }
                })
            }, 200);
        });
    }).then(passWindowId)
    .catch(function(e) {
        console.log(e);
    });
    //*/

    /*
    getContentWindowInfo().then(function(info) {
        console.log("info: ", info);
    });
    getContentWindowInfo().then(checkOpenOneSideex).then(openSideexWindow).then(function(windowInfo) {
        console.log("get the window info", windowInfo);
        let contentWindowInfo = windowInfo[0];
        let sideexWindowInfo = windowInfo[1];
        console.log("contentWindowInfo Id:" + contentWindowInfo.id);
        console.log("sideexWindowInfo Id:" + sideexWindowInfo.id);
        return new Promise(function(resolve, reject) {
            let count = 0;
            let interval = setInterval(function() {
                if (count > 100) {
                    reject("SideeX editor has no response");
                    clearInterval(interval);
                }

                browser.tabs.query({
                    active: true,
                    windowId: sideexWindowInfo.id
                }).then(function(tabs) {
                    if (tabs.length != 1) {
                        count++;
                        return;
                    }
                    let sideexTabInfo = tabs[0];
                    if (sideexTabInfo.status == "loading") {
                        count++;
                        return;
                    } else {
                        console.log("SideeX has been fully loaded")
                        resolve(windowInfo);
                        clearInterval(interval);
                    }
                })
            }, 200);
        });
    }).then(passWindowId)
    .catch(function(e) {
        console.log(e);
    });
    //*/

    browser.contextMenus.create({
	    id: "verifyText",
	    title: "verifyText",
	    documentUrlPatterns: ["<all_urls>"]
	});
	browser.contextMenus.create({
	    id: "verifyTitle",
	    title: "verifyTitle",
    	documentUrlPatterns: ["<all_urls>"]
	});
	browser.contextMenus.create({
	    id: "assertText",
	    title: "assertText",
	    documentUrlPatterns: ["<all_urls>"]
	});
	browser.contextMenus.create({
	    id: "assertTitle",
	    title: "assertTitle",
	    documentUrlPatterns: ["<all_urls>"]
	});
	browser.contextMenus.create({
	    id: "storeText",
	    title: "storeText",
	    documentUrlPatterns: ["<all_urls>"]
	    //contexts: ["all"]
	});
	browser.contextMenus.create({
	    id: "storeTitle",
	    title: "storeTitle",
	    documentUrlPatterns: ["<all_urls>"]
	    //contexts: ["all"]
	});

}

browser.browserAction.onClicked.addListener(openPage);

function disconnectAllTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(tab.id, { active: false });
    }
}

function queryError(error) {
    console.log(`Error: ${error}`);
}

browser.windows.onRemoved.addListener(function(windowId) {
    if (windowId === panelId) {
        console.log("Editor has closed");
        var querying = browser.tabs.query({ url: "<all_urls>" });
        querying.then(disconnectAllTabs, queryError);
        panelId = undefined;
    }

    browser.contextMenus.removeAll();
});

function passWindowId(windowInfo){
    let contentWindowInfo = windowInfo[0];
    let sideexWindowInfo = windowInfo[1];
    let contentWindowId = contentWindowInfo.id;
    let sideexTabId = sideexWindowInfo.tabs[0].id;

    // Seems like we don't need to pass information to content scripts
    /*
    browser.tabs.query({
        windowId: contentWindowId,
        url: "<all_urls>"
    }).then(function(tabs) {
        for (let tab of tabs) {
            browser.tabs.sendMessage(tab.id, {
                selfTabId: tab.id,
                commWindowId: sideexWindowId
            }).catch(onError);
        }
    }).catch(onError);
    */

    return browser.tabs.sendMessage(sideexTabId, {
        selfTabId: sideexTabId,
        commWindowId: contentWindowId
    });
};

var port;
browser.contextMenus.onClicked.addListener(function(info, tab) {
    port.postMessage({ cmd: info.menuItemId });
});

browser.runtime.onConnect.addListener(function(m) {
    port = m;
});
