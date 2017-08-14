var panelId = undefined;

function onCreated(windowInfo) {
    console.log(`Create editor successfully: id = ${windowInfo.id}`);
    panelId = windowInfo.id;
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function openPage() {
    var getContentWindowInfo = browser.windows.getLastFocused();
    var getSideexWindowInfo = browser.windows.create({
        url: browser.extension.getURL("panel.html"),
        type: "popup",
        height: 730,
        width: 695
    });

    Promise.all([getContentWindowInfo, getSideexWindowInfo])
    .then(function(windowInfo) {
        console.log("get the window info")
        let contentWindowInfo = windowInfo[0];
        let sideexWindowInfo = windowInfo[1];
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

    browser.contextMenus.create({
    id: "verifyText",
    title: "verifyText"
	});
	browser.contextMenus.create({
	    id: "verifyTitle",
	    title: "verifyTitle"
	});
	browser.contextMenus.create({
	    id: "assertText",
	    title: "assertText"
	});
	browser.contextMenus.create({
	    id: "assertTitle",
	    title: "assertTitle"
	});
	browser.contextMenus.create({
	    id: "storeText",
	    title: "storeText"
	    //contexts: ["all"]
	});
	browser.contextMenus.create({
	    id: "storeTitle",
	    title: "storeTitle"
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
