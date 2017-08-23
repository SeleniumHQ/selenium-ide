var SEIDE = {
    scripts: [
        "/src/autobus/sampleExtraScript.js"
    ]
};

SEIDE.executeOnPage = (messageId, data) => {
    data = typeof data === "object" ? data : {};
    data.messageId = messageId;
    browser.tabs.sendMessage(SEIDE._automated_tab_id, data).then(SEIDE._responseHandler);
};

SEIDE._responseHandler = () => {
    var response = document.createElement("div");
    response.className = "response";
    response.appendChild(document.createTextNode(JSON.stringify(arguments[0])));
    document.getElementById("responses").appendChild(response);
};

SEIDE.enableInTab = (tabId) => {
    SEIDE._automated_tab_id = tabId;
    browser.tabs.executeScript(tabId, {
        file: "/src/autobus/communication.js"
    }).then(() => {
        document.body.style.border = "3px solid green";
        SEIDE.executeOnPage("enable", {
            logo_url:browser.extension.getURL("icons/icon.png"),
            "scripts":SEIDE.scripts.map(x=>browser.extension.getURL(x))
        });
    });
};

(() => {
  if (window.location.href.indexOf("tabId=") > 0) {
      SEIDE.enableInTab(parseInt(window.location.href.split("tabId=")[1], 10));
  }
})();
