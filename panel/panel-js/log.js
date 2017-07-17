var sideex_log = {};

sideex_log.info = function(str) {
    var div = document.createElement('div');
    div.setAttribute("class", "log-info");
    str = "[info] " + str;
    div.innerHTML = escapeHTML(str);
    document.getElementById("logcontainer").appendChild(div);
    $("#logcontainer").scrollTop($("#logcontainer")[0].scrollHeight);
}

sideex_log.error = function(str) {
    var div = document.createElement('div');
    div.setAttribute("class", "log-error");
    str = "[error] " + str;
    div.innerHTML = escapeHTML(str);
    document.getElementById("logcontainer").appendChild(div);
    $("#logcontainer").scrollTop($("#logcontainer")[0].scrollHeight);
}

document.getElementById("clear-log").addEventListener("click", function(){
    document.getElementById("logcontainer").innerHTML = "";
}, false);
