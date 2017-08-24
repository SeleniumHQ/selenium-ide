
class SEIDE {
    constructor() {
        this._scripts = [
            browser.extension.getURL("/src/autobus/sampleExtraScript.js")
        ];
    }
    
    executeOnPage (messageId, data, log_response = true) {
        data = typeof data === "object" ? data : {};
        data.messageId = messageId;
        var promise = browser.tabs.sendMessage(this._automated_tab_id, data)
        if (log_response) {
            promise.then(this._default_responseHandler);
        }
        return promise;
    }

    _default_responseHandler (resp) {
        var response = document.createElement("div");
        response.className = "response";
        response.appendChild(document.createTextNode(JSON.stringify(resp)));
        document.getElementById("responses").appendChild(response);
    }

    enableInTab (tabId) {
        this._automated_tab_id = tabId;
        browser.tabs.executeScript(tabId, {
            file: "/src/autobus/communication.js"
        }).then(() => {
            document.body.style.border = "3px solid green";
            this.executeOnPage("enable", {
                logo_url:browser.extension.getURL("icons/icon.png"),
                "scripts":this._scripts
            });
        });
    }
};

(() => {
  if (window.location.href.indexOf("tabId=") > 0) {
      new SEIDE().enableInTab(parseInt(window.location.href.split("tabId=")[1], 10));
  }
})();
