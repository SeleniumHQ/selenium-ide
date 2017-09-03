function ExtCommand(contentWindowId) {
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingTabId = -1;
    this.contentWindowId = contentWindowId ? contentWindowId : -1;
    this.currentPlayingFrameLocation = 'root';
    this.waitInterval = 500;
    this.waitTimes = 60;
}

ExtCommand.prototype.doOpen = function(url) {
    return browser.tabs.update(this.currentPlayingTabId, {
        url: url
    })
}

ExtCommand.prototype.setContentWindowId = function(contentWindowId) {
    this.contentWindowId = contentWindowId;
}

ExtCommand.prototype.getContentWindowId = function(){
    return this.contentWindowId;
}

ExtCommand.prototype.init = function() {
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingWindowId = this.contentWindowId;
    let self = this;
    this.currentPlayingFrameLocation = "root";
    return this.queryActiveTab(this.currentPlayingWindowId)
           .then(function setFirstTab(tab) {
               self.currentPlayingTabId = tab.id;
               self.playingTabNames["win_ser_local"] = self.currentPlayingTabId;
               self.playingTabIds[self.currentPlayingTabId] = "win_ser_local";
               self.playingFrameLocations[self.currentPlayingTabId] = {};
               self.playingFrameLocations[self.currentPlayingTabId]["root"] = 0;
               // we assume that there has an "open" command
               // select Frame directly will cause failed
               self.playingFrameLocations[self.currentPlayingTabId]["status"] = true;
           }).catch(function createNewWindow(e){
               console.log(e);
               // : TODO: create a new window if not exist
           });
}

ExtCommand.prototype.getCurrentPlayingTabId = function() {
    return this.currentPlayingTabId;
}

ExtCommand.prototype.getCurrentPlayingFrameLocation = function() {
    return this.currentPlayingFrameLocation;
}

ExtCommand.prototype.getFrame = function (tabId) {
    if (tabId)
        return this.playingFrameLocations[tabId][this.currentPlayingFrameLocation];
    return this.playingFrameLocations[this.currentPlayingTabId][this.currentPlayingFrameLocation];
}

ExtCommand.prototype.doPause = function(ignored, milliseconds) {
    return new Promise(function(resolve) {
        setTimeout(resolve, milliseconds);
    });
}

ExtCommand.prototype.doSelectFrame = function(frameLocation) {
    let result = frameLocation.match(/(index|relative) *= *([\d]+|parent)/i);
    if (result && result[2]) {
        let position = result[2];
        if (position == "parent") {
            this.currentPlayingFrameLocation = this.currentPlayingFrameLocation.slice(0, this.currentPlayingFrameLocation.lastIndexOf(':'));
        } else {
            this.currentPlayingFrameLocation += ":" + position;
        }
        return this.wait("playingFrameLocations", this.currentPlayingTabId, this.currentPlayingFrameLocation);
    } else {
        return Promise.reject("Invalid argument");
    }
}

ExtCommand.prototype.doSelectWindow = function(serialNumber) {
    let self = this;
    return this.wait("playingTabNames", serialNumber)
           .then(function() {
               self.currentPlayingTabId = self.playingTabNames[serialNumber];
               browser.tabs.update(self.currentPlayingTabId, {active: true});
           })
}

ExtCommand.prototype.doClose = function() {
    let removingTabId = this.currentPlayingTabId;
    this.currentPlayingTabId = -1;
    delete this.playingFrameLocations[removingTabId];
    return browser.tabs.remove(removingTabId);
}

ExtCommand.prototype.wait = function(...properties) {
    if (!properties.length)
        return Promise.reject("No arguments");
    let self = this;
    let ref = this;
    let inspecting = properties[properties.length - 1];
    //console.log("Inspecting: " + inspecting);
    for (let i = 0; i < properties.length - 1; i++) {
        //console.log("properties[" + i + "] : " + properties[i]);
        if (!ref[properties[i]] | !(ref[properties[i]] instanceof Array | ref[properties[i]] instanceof Object))
            return Promise.reject("Invalid Argument");
        ref = ref[properties[i]];
        //console.log("ref : " + properties[i]);
        //console.log(ref);
    }
    return new Promise(function(resolve, reject) {
        let counter = 0;
        let interval = setInterval(function() {
            if (ref[inspecting] == undefined) {
                //console.log("In counter");
                //ref = ref;
                //console.log(ref);
                counter++;
                if (counter > self.waitTimes) {
                    reject("Timeout");
                    clearInterval(interval);
                }
            } else {
                resolve();
                clearInterval(interval);
            }
        }, self.waitInterval);
    })
}

ExtCommand.prototype.getPageStatus = function() {
    return this.playingFrameLocations[this.getCurrentPlayingTabId()]["status"];
}

ExtCommand.prototype.queryActiveTab = function (windowId) {
    return browser.tabs.query({windowId: windowId, active: true, url: "<all_urls>"})
       .then(function(tabs) {
           if (!tabs.length)
               return Promise.reject("No matched Tab");
           return tabs[0];
       });
}

ExtCommand.prototype.sendMessage = function(command, target, value) {
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getFrame();
    return browser.tabs.sendMessage(tabId, {
        commands: command,
        target: target,
        value: value
    }, { frameId: frameId });
}

function isExtCommand(command) {
    switch(command) {
        case "pause":
        //case "open":
        case "selectFrame":
        case "selectWindow":
        case "close":
            return true;
        default:
            return false;
    }
}

ExtCommand.prototype.setLoading = function(tabId) {
    console.log("setLoading");
    // Does clearing the object will cause some problem(e.g. missing the frameId)?
    // Ans: Yes, but I don't know why
    this.initTabInfo(tabId);
    // this.initTabInfo(tabId, true); (failed)
    this.playingFrameLocations[tabId]["status"] = false;
}

ExtCommand.prototype.setComplete = function(tabId) {
    //console.log("setComplete");
    this.initTabInfo(tabId);
    this.playingFrameLocations[tabId]["status"] = true;
}

ExtCommand.prototype.initTabInfo = function(tabId, forced) {
    //console.log("initTabInfo");
    if (!this.playingFrameLocations[tabId] | forced) {
        //console.log("init");
        this.playingFrameLocations[tabId] = {};
        this.playingFrameLocations[tabId]["root"] = 0;
    }
}

ExtCommand.prototype.setFrame = function(tabId, frameLocation, frameId) {
    ////this.initTabInfo(tabId);
    //console.log("setFrame: tabId=" + tabId + " frameLocation=" + frameLocation + " frameId=" + frameId);
    this.playingFrameLocations[tabId][frameLocation] = frameId;
    //console.log("set Frame finished")
    //console.log(this.playingFrameLocations[tabId]);
}

ExtCommand.prototype.hasTab = function(tabId) {
    return this.playingTabIds[tabId];
}

ExtCommand.prototype.setNewTab = function(tabId) {
    this.playingTabNames["win_ser_" + this.playingTabCount] = tabId;
    this.playingTabIds[tabId] = "win_ser_" + this.playingTabCount;
    this.playingTabCount++;
}