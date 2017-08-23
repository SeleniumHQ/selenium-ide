var HANDLERS = {
    // default throws exception
    "": x=>{ throw "undefined request messageId"; }
};

function REGISTER_HANDLER(messageId, handler) {
    HANDLERS[messageId] = handler;
};

function onMessageReceived(request, sender, sendResponse) {
    var messageId = request.messageId || "";
    if (messageId in HANDLERS) {
        try {
            HANDLERS[messageId](request, sendResponse);
        } catch (e) {
            sendResponse(e);
        }
    } else {
        throw messageId + " is not mapped to any handler.";
    }
};

browser.runtime.onMessage.addListener(onMessageReceived);

(() => {

    var SE_IDE_BADGE_ID = "_SELENIUM_IDE_BADGE_ELEMENT_"; 

    function renderAutomationEnabled(data, response) {

        if (document.getElementById(SE_IDE_BADGE_ID)) {
            response("badge already exists");
            return;
        }

        document.body.style.border = "5px purple solid";
        var ide_badge = document.createElement("div"),
            ide_logo = document.createElement("img");
        ide_logo.src = data.logo_url;
        ide_logo.style.padding = "5px";

        ide_badge.appendChild(ide_logo);
        ide_badge.appendChild(document.createTextNode("Automation Enabled."));

        ide_badge.style.position = "absolute";
        ide_badge.style.background = "white";
        ide_badge.style.border = "1px solid black";
        ide_badge.style.top = "0px";
        ide_badge.style.zIndex = "10000000000";
        ide_badge.style.borderRadius = "8px";
        // jump the icon to the other side of the page to avoid it covering something someone might need
        ide_badge.onmouseover = (evt) => {
            evt.target.style.right = evt.target.style.right ? "" : "0px";
        };


        ide_badge.id = SE_IDE_BADGE_ID;

        ide_badge = document.body.appendChild(ide_badge);

        if (data.scripts && data.scripts.length > 0) {
          for (var i=0; i<data.scripts.length; i++) {
            var s = document.createElement("script");
            s.src = data.scripts[i];
            document.body.appendChild(s);
          }
        }
        response("success");
    }

    REGISTER_HANDLER("enable", renderAutomationEnabled);
})();
