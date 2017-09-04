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

var originalPrompt = originalPrompt ? originalPrompt : window.prompt;
//var topPrompt = topPrompt ? topPrompt : window.top.prompt;
var nextPromptResult = false;
var recordedPrompt = null;

var originalConfirmation = originalConfirmation ? originalConfirmation : window.confirm;
var nextConfirmationResult = false;
var recordedConfirmation = null;

var originalAlert = originalAlert ? originalAlert : window.alert;
var nextAlertResult = false;
var recordedAlert = null;

//before record prompt
if (window != window.top) {
    window.prompt = function(text, defaultText) {
        if (document.body.hasAttribute("SideeXPlayingFlag")) {
            //recordedPrompt = text;
            console.log("frame is playing prompt");
            return window.top.prompt(text, defaultText);
        } else {
            let result = originalPrompt(text, defaultText);
            let frameLocation = "";
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
            window.top.postMessage({
                direction: "from-page-script",
                recordedType: "prompt",
                recordedMessage: text,
                recordedResult: result,
                frameLocation: frameLocation
            }, "*");
            return result;
        }
    };
} else {
    window.prompt = function(text, defaultText) {
        console.log("parent window.prompt triggered");
        console.log(document.body.hasAttribute("setPrompt"));
        if (document.body.hasAttribute("setPrompt")) {
            recordedPrompt = text;
            console.log("Type: playing");;
            document.body.removeAttribute("setPrompt");
            return nextPromptResult;
        } else {
            console.log("Type: recording");
            let result = originalPrompt(text, defaultText);
            let frameLocation = "";
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
            window.top.postMessage({
                direction: "from-page-script",
                recordedType: "prompt",
                recordedMessage: text,
                recordedResult: result,
                frameLocation: frameLocation
            }, "*");
            return result;
        }
    };
}

//before record confirm
window.confirm = function(text) {
    if (document.body.hasAttribute("SideeXPlayingFlag")) {
        recordedConfirmation = text;
        return nextConfirmationResult;
    } else {
        let result = originalConfirmation(text);
        window.postMessage({
            direction: "from-page-script",
            recordedType: "confirm",
            recordedMessage: text,
            recordedResult: result,
        }, "*");
        return result;
    }
};
//before record alert
window.alert=function(text){
    if(document.body.hasAttribute("SideeXPlayingFlag")){
        recordedAlert=text;
        return nextAlertResult;
    }else{
        let result=originalAlert(text);
        window.postMessage({
            direction:"from-page-script",
            recordedType: "alert",
            recordedMessage: text,
            recordedResult:result,
        },"*");
        return result;
    }
};

//play window methods
if (window == window.top) {
    window.addEventListener("message", function(event) {
        //console.log(event);
        if (event.source == window && event.data &&
            event.data.direction == "from-content-script") {
            let result = undefined;
            switch (event.data.command) {
                case "setNextPromptResult":
                    nextPromptResult = event.data.target;
                    document.body.setAttribute("setPrompt", true);
                    window.postMessage({
                        direction: "from-page-script",
                        response: "prompt"
                    }, "*");
                    break;
                case "getPromptMessage":
                    result = recordedPrompt;
                    recordedPrompt = null;
                    window.postMessage({
                        direction: "from-page-script",
                        response: "prompt",
                        value: result
                    }, "*");
                    break;
                case "setNextConfirmationResult":
                    nextConfirmationResult = event.data.target;
                    window.postMessage({
                        direction: "from-page-script",
                        response: "confirm"
                    }, "*");
                    break;
                case "getConfirmationMessage":
                    result = recordedConfirmation;
                    recordedConfirmation = null;
                    try{
                        console.error("no");
                        window.postMessage({
                            direction: "from-page-script",
                            response: "confirm",
                            value: result
                        }, "*");
                    } catch (e) {
                        console.error(e);
                    }
                    break;

                case "setNextAlertResult":
                    nextAlertResult=event.data.target;
                    window.postMessage({
                        direction: "from-page-script",
                        response: "alert"
                    },"*");
                    break;
                case "getAlertMessage":
                    let result1=recordedAlert;
                    recordedAlert=null;
                    window.postMessage({
                        direction: "from-page-script",
                        response: "alert",
                        value: result1
                    },"*");
                    break;
            
            }
        }
    });
}