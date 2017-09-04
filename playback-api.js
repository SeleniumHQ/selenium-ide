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

var playingTabIds = {};
var playingTabNames = {};
var playingTabCount = 1;
var currentPlayingFrameLocation = "root";
var currentPlayingCommandIndex = -1;

var currentTestCaseId = "";
var isPause = false;
var pauseValue = null;
var isPlayingSuite = false;
var isPlayingAll = false;
var selectTabId = null;
var isSelecting = false;

var commandType = "";
var pageCount = 0;
var pageTime = "";
var ajaxCount = 0;
var ajaxTime = "";
var domCount = 0;
var domTime = "";
var implicitCount = 0;
var implicitTime = "";

var caseFailed = false;
var extCommand = new ExtCommand();

window.onload = function() {
    var recordButton = document.getElementById("record");
    var playButton = document.getElementById("playback");
    var stopButton = document.getElementById("stop");
    var pauseButton = document.getElementById("pause");
    var resumeButton = document.getElementById("resume");
    var playSuiteButton = document.getElementById("playSuite");
    var playSuitesButton = document.getElementById("playSuites");
    var showElementButton = document.getElementById("showElementButton")
    var selectElementButton = document.getElementById("selectElementButton");
    /*var recordButton = document.getElementById("record");*/
    //element.addEventListener("click",play);
    recordButton.addEventListener("click", function(){
        isRecording = !isRecording;
        if (isRecording) {
            notificationCount = 0;
            recordButton.childNodes[1].textContent = "Stop";
        }
        else {
            recordButton.childNodes[1].textContent = "Record";
        }
    })
    playButton.addEventListener("click", function() {
        document.getElementById("result-runs").innerHTML = "0";
        document.getElementById("result-failures").innerHTML = "0";
        initAllSuite();
        setCaseScrollTop(getSelectedCase());
        play();
    });
    stopButton.addEventListener("click", function() {
        stop();
    });
    pauseButton.addEventListener("click", pause);
    pauseButton.disabled = true;
    resumeButton.addEventListener("click", resume);
    playSuiteButton.addEventListener("click", function() {
        document.getElementById("result-runs").innerHTML = "0";
        document.getElementById("result-failures").innerHTML = "0";
        console.error("playSuite");
        initAllSuite();
        playSuite(0);
    });
    playSuitesButton.addEventListener("click", function() {
        document.getElementById("result-runs").innerHTML = "0";
        document.getElementById("result-failures").innerHTML = "0";
        console.error("playSuites");
        initAllSuite();
        playSuites(0);
    });
    selectElementButton.addEventListener("click",function(){
        var button = document.getElementById("selectElementButton");
        if (isSelecting) {
            isSelecting = false; 
            button.textContent = "Select";
            browser.tabs.query({
                active: true,
                windowId: contentWindowId
            }).then(function(tabs) {
                browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: false});
            }).catch(function(reason) {
                console.log(reason);
            })
            return;
        }

        isSelecting = true;
        if (isRecording)
            /* TODO: disable record button */
            isRecording = false;
        button.textContent = "Cancel";
        browser.tabs.query({
            active: true,
            windowId: contentWindowId
        }).then(function(tabs) {
            if (tabs.length === 0) {
                console.log("No match tabs");
                isSelecting = false; 
                button.textContent = "Select";
            } else
                browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: true});
        })
    });
    showElementButton.addEventListener("click", function(){
        console.log("click");
        try{
        var targetValue = document.getElementById("command-target").value;
            console.log("value: " + targetValue);
            browser.tabs.query({
                active: true,
                windowId: contentWindowId
            }).then(function(tabs) {
                if (tabs.length === 0) {
                    console.log("No match tabs");
                } else {
                    browser.tabs.sendMessage(tabs[0].id, {
                        showElement: true,
                        targetValue: targetValue
                    }).then(function(response) {
                        if (response){
                            console.log(response.result);
                        }
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }
    });
    /*recordButton.addEventListener("click", startRecord);*/
    //console.error(recordButton);
};

function disableClick() {
    document.getElementById("pause").disabled = false;
    document.getElementById('testCase-grid').style.pointerEvents = 'none';
    document.getElementById('command-container').style.pointerEvents = 'none';
}

function enableClick() {
    document.getElementById("pause").disabled = true;
    document.getElementById('testCase-grid').style.pointerEvents = 'auto';
    document.getElementById('command-container').style.pointerEvents = 'auto';
}

function play() {
    initializePlayingProgress()
        .then(executionLoop)
        .then(finalizePlayingProgress)
        .catch(catchPlayingError);
}

function stop() {
    if (isPause){
        resume();
    }
    isPlaying = false;
    isPlayingSuite = false;
    isPlayingAll = false;
    switchPS();
    sideex_log.info("Stop executing");
    initAllSuite();
    document.getElementById("result-runs").innerHTML = "0";
    document.getElementById("result-failures").innerHTML = "0";
    finalizePlayingProgress();
}

function playAfterConnectionFailed() {
    initializeAfterConnectionFailed()
        .then(executionLoop)
        .then(finalizePlayingProgress)
        .catch(catchPlayingError);
}

function initializeAfterConnectionFailed() {
    disableClick();

    isRecording = false;
    isPlaying = true;

    commandType = "preparation";
    pageCount = ajaxCount = domCount = implicitCount = 0;
    pageTime = ajaxTime = domTime = implicitTime = "";

    caseFailed = false;

    currentTestCaseId = getSelectedCase().id;
    var commands = getRecordsArray();

    return Promise.resolve(true);
}

function pause() {
    if (isPlaying) {
        sideex_log.info("Pausing");
        isPause = true;
        switchPR();
    }
}

function resume() {
    if(currentTestCaseId!=getSelectedCase().id)
        setSelectedCase(currentTestCaseId);
    if (isPause) {
        sideex_log.info("Resuming");
        isPlaying = true;
        isPause = false;
        switchPR();
        disableClick();
        executionLoop()
            .then(finalizePlayingProgress)
            .catch(catchPlayingError);
    }
}

function initAllSuite() {
    var suites = document.getElementById("testCase-grid").getElementsByClassName("message");
    var length = suites.length;
    for (var k = 0; k < suites.length; ++k) {
        var cases = suites[k].getElementsByTagName("p");
        for (var u = 0; u < cases.length; ++u) {
            $("#" + cases[u].id).removeClass('fail success');
        }
    }
}

function playSuite(i) {
    isPlayingSuite = true;
    var cases = getSelectedSuite().getElementsByTagName("p");
    var length = cases.length;
    if (i == 0) {
        sideex_log.info("Playing test suite " + sideex_testSuite[getSelectedSuite().id].title);
    }
    if (i < length) {
        setSelectedCase(cases[i].id);
        setCaseScrollTop(getSelectedCase());
        sideex_log.info("Playing test case " + sideex_testCase[cases[i].id].title);
        play();
        nextCase(i);
    } else {
        isPlayingSuite = false;
        switchPS();
    }
}

function nextCase(i) {
    if (isPlaying || isPause) setTimeout(function() {
        nextCase(i);
    }, 500);
    else if(isPlayingSuite) playSuite(i + 1);
}

function playSuites(i) {
    isPlayingAll = true;
    var suites = document.getElementById("testCase-grid").getElementsByClassName("message");
    var length = suites.length;
    if (i < length) {
        if (suites[i].id.includes("suite")) {
            setSelectedSuite(suites[i].id);
            playSuite(0);
        }
        nextSuite(i);
    } else {
        isPlayingAll = false;
        switchPS();
    }
}

function nextSuite(i) {
    if (isPlayingSuite) setTimeout(function() {
        nextSuite(i);
    }, 2000);
    else if(isPlayingAll) playSuites(i + 1);
}

function executeCommand(index) {
    var id = parseInt(index) - 1;
    var commands = getRecordsArray();
    var commandName = getCommandName(commands[id]);
    var commandTarget = getCommandTarget(commands[id]);
    var commandValue = getCommandValue(commands[id]);

    sideex_log.info("Executing: | " + commandName + " | " + commandTarget + " | " + commandValue + " |");

    initializePlayingProgress(true);

    setColor(id + 1, "executing");

    browser.tabs.query({
            windowId: extCommand.getContentWindowId(),
            active: true
        })
        .then(function(tabs) {
            return browser.tabs.sendMessage(tabs[0].id, {
                commands: commandName,
                target: commandTarget,
                value: commandValue
            }, {
                frameId: extCommand.getFrame(tabs[0].id)
            })
        })
        .then(function(result) {
            if (result.result != "success") {
                sideex_log.error(result.result);
                setColor(id + 1, "fail");
                if (!result.result.includes("did not match")) {
                    return true;
                }
            } else {
                setColor(id + 1, "success");
            }
        })

    finalizePlayingProgress();
}

function onError(error) {
    console.log("QAQ");
    alert(`Error: ${error}`);
}

function cleanStatus() {
    var commands = getRecordsArray();
    for (var i = 0; i < commands.length; ++i) {
        commands[i].setAttribute("class", "");
    }
    classifyRecords(1, commands.length);
}

function initializePlayingProgress(isDbclick) {
    disableClick();
    
    isRecording = false;
    isPlaying = true;

    switchPS();

    currentPlayingCommandIndex = -1;

    // xian wait
    pageCount = ajaxCount = domCount = implicitCount = 0;
    pageTime = ajaxTime = domTime = implicitTime = "";

    caseFailed = false;

    currentTestCaseId = getSelectedCase().id;

    if (!isDbclick) {
        $("#" + currentTestCaseId).removeClass('fail success');
    }
    var commands = getRecordsArray();

    cleanStatus();

    return extCommand.init();
}

function executionLoop() {
    if (!isPlaying) {
        cleanStatus();
        return false;
    }

    if (isPause) {
        return true;
    }

    currentPlayingCommandIndex++;
    let commands = getRecordsArray();
    if (currentPlayingCommandIndex >= commands.length) {
        if (!caseFailed) {
            setColor(currentTestCaseId, "success");
            document.getElementById("result-runs").innerHTML = parseInt(document.getElementById("result-runs").innerHTML) + 1;
            declaredVars = {};
            sideex_log.info("Test case passed");
        } else {
            caseFailed = false;
        }
        return true;
    }

    let commandName = getCommandName(commands[currentPlayingCommandIndex]);
    let commandTarget = getCommandTarget(commands[currentPlayingCommandIndex]);
    let commandValue = getCommandValue(commands[currentPlayingCommandIndex]);


    setColor(currentPlayingCommandIndex + 1, "executing");

    if (isExtCommand(commandName)) {
        sideex_log.info("Executing: | " + commandName + " | " + commandTarget + " | " + commandValue + " |");
        let upperCase = commandName.charAt(0).toUpperCase() + commandName.slice(1);
        return (extCommand["do" + upperCase](commandTarget, commandValue))
           .then(function() {
               setColor(currentPlayingCommandIndex + 1, "success");
           }).then(executionLoop); 
    } else {
        return doPreparation()
           .then(doPrePageWait)
           .then(doPageWait)
           .then(doAjaxWait)
           .then(doDomWait)
           .then(doCommand)
           .then(executionLoop)
    }
}

function finalizePlayingProgress() {
    enableClick();
    playingTabIds = {};
    playingTabNames = {};
    playingTabCount = 1;
    //console.log("success");
    setTimeout(function() {
        isPlaying = false;
        //isRecording = true;
        switchPS();
    }, 500);
}

document.addEventListener("dblclick", function(event) {
    var temp = event.target;
    while (temp.tagName.toLowerCase() != "body") {
        if (/records-(\d)+/.test(temp.id)) {
            var index = temp.id.split("-")[1];
            executeCommand(index);
        }
        if (temp.id == "command-grid") {
            break;
        } else temp = temp.parentElement;
    }
});

function playDisable(setting) {
    if (setting)
        document.getElementById("record").childNodes[1].textContent = "Record";
    document.getElementById("record").disabled = setting;
    document.getElementById("playback").disabled = setting;
    document.getElementById("playSuite").disabled = setting;
    document.getElementById("playSuites").disabled = setting;
}

function switchPS() {
    if ((isPlaying||isPause)||isPlayingSuite||isPlayingAll) {
        playDisable(true);
        document.getElementById("playback").style.display = "none";
        document.getElementById("stop").style.display = "";
    } else {
        playDisable(false);
        document.getElementById("playback").style.display = "";
        document.getElementById("stop").style.display = "none";
    }
}

function switchPR() {
    if (isPause) {
        // playDisable(true);
        document.getElementById("pause").style.display = "none";
        document.getElementById("resume").style.display = "";
    } else {
        // playDisable(false);
        document.getElementById("pause").style.display = "";
        document.getElementById("resume").style.display = "none";
    }
}

function catchPlayingError(reason) {
    // doCommands is depend on test website, so if make a new page,
    // doCommands funciton will fail, so keep retrying to get connection
    if (isReceivingEndError(reason)) {
        commandType = "preparation";
        setTimeout(function() {
            currentPlayingCommandIndex--;
            playAfterConnectionFailed();
        }, 100);
    } else {
        enableClick();
        console.log("REASON: ")
        console.log(reason);
        sideex_log.error(reason);

        if (currentPlayingCommandIndex == -1) {
            currentPlayingCommandIndex++;
        }
        setColor(currentPlayingCommandIndex + 1, "fail");
        setColor(currentTestCaseId, "fail");
        document.getElementById("result-failures").innerHTML = parseInt(document.getElementById("result-failures").innerHTML) + 1;
        sideex_log.info("Test case failed");

        playingTabIds = {};
        playingTabNames = {};
        playingTabCount = 1;

        /* Clear the flag, reset to recording phase */
        /* A small delay for preventing recording events triggered in playing phase*/

        setTimeout(function() {
            isPlaying = false;
            //isRecording = true;
            switchPS();
        }, 500);
    }
}

function doPreparation() {
    console.log("in preparation");
    return extCommand.sendMessage("waitPreparation", "", "")
        .then(function() {
            return true;
        })
}


function doPrePageWait() {
    console.log("in prePageWait");
    return extCommand.sendMessage("prePageWait", "", "")
       .then(function(response) {
           if (response && response.new_page) {
               console.log("prePageWaiting");
               return doPrePageWait();
           } else {
               return true;
           }
       })
}

function doPageWait() {
    console.log("in pageWait");
    return extCommand.sendMessage("pageWait", "", "")
        .then(function(response) {
            if (pageTime && (Date.now() - pageTime) > 30000) {
                sideex_log.error("Page Wait timed out after 30000ms");
                pageCount = 0;
                pageTime = "";
                return true;
            } else if (response && response.page_done) {
                pageCount = 0;
                pageTime = "";
                return true;
            } else {
                pageCount++;
                if (pageCount == 1) {
                    pageTime = Date.now();
                    sideex_log.info("Wait for the new page to be fully loaded");
                }
                return doPageWait();
            }
        })
}

function doAjaxWait() {
    console.log("in ajaxWait");
    return extCommand.sendMessage("ajaxWait", "", "")
        .then(function(response) {
            if (ajaxTime && (Date.now() - ajaxTime) > 30000) {
                sideex_log.error("Ajax Wait timed out after 30000ms");
                ajaxCount = 0;
                ajaxTime = "";
                return true;
            } else if (response && response.ajax_done) {
                ajaxCount = 0;
                ajaxTime = "";
                return true;
            } else {
                ajaxCount++;
                if (ajaxCount == 1) {
                    ajaxTime = Date.now();
                    sideex_log.info("Wait for all ajax requests to be done");
                }
                return doAjaxWait();
            }
        })
}

function doDomWait() {
    console.log("in domWait");
    return extCommand.sendMessage("domWait", "", "")
        .then(function(response) {
            if (domTime && (Date.now() - domTime) > 30000) {
                sideex_log.error("DOM Wait timed out after 30000ms");
                domCount = 0;
                domTime = "";
                return true;
            } else if (response && (Date.now() - response.dom_time) < 400) {
                domCount++;
                if (domCount == 1) {
                    domTime = Date.now();
                    sideex_log.info("Wait for the DOM tree modification");
                }
                return doDomWait();
            } else {
                domCount = 0;
                domTime = "";
                return true;
            }
        })
}

function doCommand() {
    let commands = getRecordsArray();
    let commandName = getCommandName(commands[currentPlayingCommandIndex]);
    let commandTarget = getCommandTarget(commands[currentPlayingCommandIndex]);
    let commandValue = getCommandValue(commands[currentPlayingCommandIndex]);
    console.log("in common");
    //xian wait
    //commandType = "preparation";

    if (implicitCount == 0) {
        sideex_log.info("Executing: | " + commandName + " | " + commandTarget + " | " + commandValue + " |");
    }

    let p = new Promise(function(resolve, reject) {
        let count = 0;
        let interval = setInterval(function() {
            if (count > 60) {
                sideex_log.error("Timed out after 30000ms");
                reject("Window not Found");
                clearInterval(interval);
            }
            if (!extCommand.getPageStatus()) {
                if (count == 0) {
                    sideex_log.info("Wait for the new page to be fully loaded");
                }
                count++;
            } else {
                resolve();
                clearInterval(interval);
            }
        }, 500);
    });
    return p.then(function() {
            if(commandValue.substr(0,2) === "${" && commandValue.substr(commandValue.length-1) === "}"){
                commandValue = xlateArgument(commandValue);
            }
            if(commandTarget.substr(0,2) === "${" && commandTarget.substr(commandTarget.length-1) === "}"){
                commandTarget = xlateArgument(commandTarget);
            }
            if (commandName == "answerOnNextPrompt" || commandName == "chooseCancelOnNextPrompt" || commandName == "assertPrompt")
            {
                return extCommand.sendMessage(commandName, commandTarget, commandValue, true);
            }
            return extCommand.sendMessage(commandName, commandTarget, commandValue);
        })
        .then(function(result) {
            if (result.result != "success") {
                // implicit
                if (result.result.match(/Element[\s\S]*?not found/)) {
                    if (implicitTime && (Date.now() - implicitTime > 30000)) {
                        sideex_log.error("Implicit Wait timed out after 30000ms");
                        implicitCount = 0;
                        implicitTime = "";
                    } else {
                        implicitCount++;
                        if (implicitCount == 1) {
                            sideex_log.info("Wait until the element is found");
                            implicitTime = Date.now();
                        }
                        return doCommand();
                    }
                }

                implicitCount = 0;
                implicitTime = "";
                sideex_log.error(result.result);
                setColor(currentPlayingCommandIndex + 1, "fail");
                setColor(currentTestCaseId, "fail");
                document.getElementById("result-failures").innerHTML = parseInt(document.getElementById("result-failures").innerHTML) + 1;
                if (commandName.includes("verify") && result.result.includes("did not match")) {
                    setColor(currentPlayingCommandIndex + 1, "fail");
                } else {
                    sideex_log.info("Test case failed");
                    caseFailed = true;
                    currentPlayingCommandIndex = commands.length;
                }
            } else {
                setColor(currentPlayingCommandIndex + 1, "success");
            }
        })
}

function isReceivingEndError(reason) {
    if (reason == "TypeError: response is undefined" ||
        reason == "Error: Could not establish connection. Receiving end does not exist." ||
        // Below message is for Google Chrome
        reason.message == "Could not establish connection. Receiving end does not exist." ||
        // Google Chrome misspells "response"
        reason.message == "The message port closed before a reponse was received." ||
        reason.message == "The message port closed before a response was received." )
        return true;
    return false;
}