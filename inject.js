var originalPrompt = originalPrompt ? originalPrompt : window.prompt;
var nextPromptResult = false;
var recordedPrompt = null;
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

window.addEventListener("message", function(event) {
    if (event.source == window && event.data &&
        event.data.direction == "from-content-script") {
        switch (event.data.command) {
            case "setNextPromptResult":
                nextPromptResult = event.data.target;
                window.postMessage({
                    direction: "from-page-script",
                    response: "prompt"
                }, "*");
                break;
            case "getPromptMessage":
                let result = recordedPrompt;
                recordedPrompt = null;
                window.postMessage({
                    direction: "from-page-script",
                    response: "prompt",
                    value: result
                }, "*");
                break;
        }
    }
});