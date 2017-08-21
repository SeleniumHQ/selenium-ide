var originalPrompt = originalPrompt ? originalPrompt : window.prompt;
var nextPromptResult = false;
var recordedPrompt = null;

var originalConfirmation = originalConfirmation ? originalConfirmation : window.confirm;
var nextConfirmationResult = false;
var recordedConfirmation = null;

var originalAlert = originalAlert ? originalAlert : window.alert;
var nextAlertResult = false;
var recordedAlert = null;

//before record prompt
window.prompt = function(text, defaultText) {
    if (document.body.hasAttribute("SideeXPlayingFlag")) {
        recordedPrompt = text;
        return nextPromptResult;
    } else {
        let result = originalPrompt(text, defaultText);
        window.postMessage({
            direction: "from-page-script",
            recordedType: "prompt",
            recordedMessage: text,
            recordedResult: result,
        }, "*");
        return result;
    }
};

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

//play window methods
window.addEventListener("message", function(event) {
    if (event.source == window && event.data &&
        event.data.direction == "from-content-script") {
        let result = undefined;
        switch (event.data.command) {
            case "setNextPromptResult":
                nextPromptResult = event.data.target;
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
        }
    }
});