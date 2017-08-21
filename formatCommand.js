var declaredVars = {};

function xlateArgument(value) {
    value = value.replace(/^\s+/, '');
    value = value.replace(/\s+$/, '');
    var r;
    var r2;
    var parts = [];
    if ((r = /\$\{/.exec(value))) {
        console.info("2", r);
        var regexp = /\$\{(.*?)\}/g;
        var lastIndex = 0;
        while (r2 = regexp.exec(value)) {
            console.info("2-2", r2, declaredVars[r2[1]]);
            if (declaredVars[r2[1]]) {
                console.info("3");
                if (r2.index - lastIndex > 0) {
                    parts.push(string(value.substring(lastIndex, r2.index)));
                }
                parts.push(declaredVars[r2[1]]);
                lastIndex = regexp.lastIndex;
            } else if (r2[1] == "nbsp") {
                console.info("4");
                if (r2.index - lastIndex > 0) {
                    parts.push(declaredVars[string(value.substring(lastIndex, r2.index))]);
                }
                parts.push(nonBreakingSpace());
                lastIndex = regexp.lastIndex;
            }
        }
        if (lastIndex < value.length) {
            console.info("5", lastIndex, value.length, string(value.substring(lastIndex, value.length)));
            parts.push(string(value.substring(lastIndex, value.length)));
        }
        return parts.join("");
    } else {
        console.info("6");
        return string(value);
    }
}

function string(value) {
    if (value != null) {
        value = value.replace(/\\/g, '\\\\');
        value = value.replace(/\"/g, '\\"');
        value = value.replace(/\r/g, '\\r');
        value = value.replace(/\n/g, '\\n');
        return value;
    } else {
        return '';
    }
}

function handleFormatCommand(message, sender, response) {
    if (message.storeStr) {
        declaredVars[message.storeVar] = message.storeStr;
    } else if (message.echoStr)
        sideex_log.info("echo: " + xlateArgument(message.echoStr));
}

browser.runtime.onMessage.addListener(handleFormatCommand);
