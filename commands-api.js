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
                    var dofunction = selenium["do" + upperCase](request.target, selenium.preprocessParameter(request.value));
                    sendResponse({ result: "success" });
                } catch (e) {
                    console.log(e.message);
                    sendResponse({ result: e.message });
                }
            } else {
                sendResponse({ result: "Unknown command: " + request.commands });
            }
        }

        //do every command need giving sideex id
        if (contentSideexTabID === -1) {
            contentSideexTabID = request.mySideexTabID;
        }
        return true;
    }
    if (request.selectMode) {
        if (request.selecting) {
            targetSelecter = new TargetSelecter(function (element, win) {
                if (element && win) {
                    //var locatorBuilders = new LocatorBuilders(win);
                    var target = locatorBuilders.buildAll(element);
                    locatorBuilders.detach();
                    if (target != null && target instanceof Array) {
                        if (target) {
                            //self.editor.treeView.updateCurrentCommand('targetCandidates', target);
                            console.log("test");
                            browser.runtime.sendMessage({
                                selectTarget: true,
                                target: [[target]]
                            })
                        } else {
                            console.log("???????");
                            //alert("LOCATOR_DETECTION_FAILED");
                        }
                    }

                }
                targetSelecter = null;
            }, function () {
                browser.runtime.sendMessage({
                    cancelSelectTarget: true
                })
            });

        } else {
            if (targetSelecter) {
                targetSelecter.cleanup();
                targetSelecter = null;
                return;
            }
        }
    }

}

function doClick2(element) {
    console.error("element:" + element);
}

browser.runtime.onMessage.addListener(doCommands);
