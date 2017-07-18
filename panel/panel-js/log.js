var sideex_log = {};

sideex_log.info = function(str) {
    var div = document.createElement('h4');
    div.setAttribute("class", "log-info");
    str = "[info] " + str;
    div.innerHTML = escapeHTML(str);
    document.getElementById("logcontainer").appendChild(div);
    $("#tab4").scrollTop($("#logcontainer")[0].scrollHeight);
};

sideex_log.error = function(str) {
    var div = document.createElement('h4');
    div.setAttribute("class", "log-error");
    str = "[error] " + str;
    div.innerHTML = escapeHTML(str);
    document.getElementById("logcontainer").appendChild(div);
    $("#tab4").scrollTop($("#logcontainer")[0].scrollHeight);
};

document.getElementById("clear-log").addEventListener("click", function() {
    document.getElementById("logcontainer").innerHTML = "";
}, false);
