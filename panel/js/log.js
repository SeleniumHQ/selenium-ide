var sideex_log = {};

sideex_log.info = function(str) {
    var div = document.createElement('h4');
    div.setAttribute("class", "log-info");
    str = "[info] " + str;
    div.innerHTML = escapeHTML(str);
    document.getElementById("logcontainer").appendChild(div);
    $("#tab4").animate({
        scrollTop: ($("#logcontainer")[0].scrollHeight)
    }, 200);
};

sideex_log.error = function(str) {
    var div = document.createElement('h4');
    div.setAttribute("class", "log-error");
    str = "[error] " + str;
    div.innerHTML = escapeHTML(str);
    document.getElementById("logcontainer").appendChild(div);
    $("#tab4").animate({
        scrollTop: ($("#logcontainer")[0].scrollHeight)
    }, 200);
};

document.getElementById("clear-log").addEventListener("click", function() {
    document.getElementById("logcontainer").innerHTML = "";
}, false);
