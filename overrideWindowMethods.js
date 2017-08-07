//Record: assertConfirmation
var windowMethod = {};
windowMethod['confirm'] = window['confirm'];
window.confirm = function(message) {
    var result = windowMethod['confirm'].call(window,message);
    //console.log("is override confirm");
    messageToContent(message,result);
    return result;
}

function messageToContent(message,result) {
    window.postMessage({
        direction: "from-page-script",
        message: message,
        result: result
    },"*");
}

console.log("finish inject");