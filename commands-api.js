//var browserbot = new BrowserBot(locatorBuilders.window);
var selenium = new Selenium(BrowserBot.createForWindow(window));
//var selenium = new Selenium(locatorBuilders);
//var selenium = new Selenium(locatorBuilders.pageBot);

function doCommands(request, sender, sendResponse, type) {
    if (request.commands) {
        console.log("indoCommands: " + request.commands);
        if (request.commands == "waitPreparation") {
            selenium["doWaitPreparation"]("", selenium.preprocessParameter(""));
            sendResponse({});
        } else if (request.commands == "prePageWait") {
            selenium["doPrePageWait"]("", selenium.preprocessParameter(""));
            sendResponse({ new_page: window.sideex_new_page });
        } else if (request.commands == "pageWait") {
            selenium["doPageWait"]("", selenium.preprocessParameter(""));
            sendResponse({ page_done: window.sideex_page_done });
        } else if (request.commands == "ajaxWait") {
            selenium["doAjaxWait"]("", selenium.preprocessParameter(""));
            sendResponse({ ajax_done: window.sideex_ajax_done });
        } else if (request.commands == "domWait") {
            selenium["doDomWait"]("", selenium.preprocessParameter(""));
            sendResponse({ dom_time: window.sideex_new_page });
        } else {
            var upperCase = request.commands.charAt(0).toUpperCase() + request.commands.slice(1);
            if (selenium["do" + upperCase] != null) {
                try {
                    document.body.setAttribute("SideeXPlayingFlag", true);
                    let returnValue = selenium["do"+upperCase](request.target,selenium.preprocessParameter(request.value));                  
                    if (returnValue instanceof Promise) {
                        // The command is a asynchronous function
                        returnValue.then(function(value) {
                            // Asynchronous command completed successfully
                            document.body.removeAttribute("SideeXPlayingFlag");
                            sendResponse({result: "success"});
                        }).catch(function(reason) {
                            // Asynchronous command failed
                            document.body.removeAttribute("SideeXPlayingFlag");
                            sendResponse({result: reason});
                        });
                    } else {
                        // Synchronous command completed successfully
                        document.body.removeAttribute("SideeXPlayingFlag");
                        sendResponse({result: "success"});
                    }
                } catch(e) {
                    // Synchronous command failed
                    document.body.removeAttribute("SideeXPlayingFlag");
                    sendResponse({result: e.message});
                }
            } else {
                sendResponse({ result: "Unknown command: " + request.commands });
            }
        }

        //do every command need giving sideex id
        if (contentSideexTabID === -1) {
            contentSideexTabID = request.mySideexTabID;
        }
    }
    return true;
}

function doClick2(element) {
    console.error("element:" + element);
}

browser.runtime.onMessage.addListener(doCommands);
