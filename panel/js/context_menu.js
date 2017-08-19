// Trigger action when the contexmenu is about to be shown
$(document).bind("contextmenu", function(event) {

    $(".menu").css("left", event.pageX);
    $(".menu").css("top", event.pageY);

    if (event.target.id == "testCase-container") {
        event.preventDefault();
        $("#suite-grid-menu").show();
        return;
    }

    var child = document.getElementById("tempChild");
    if (child) document.getElementById("command-grid-menu").childNodes[1].removeChild(child);

    var temp = event.target;
    var inCommandGrid = false;
    while (temp.tagName.toLowerCase() != "body") {
        if (/records-(\d)+/.test(temp.id)) {
            var exe = document.createElement("li");
            exe.setAttribute("id", "tempChild");
            a = document.createElement("a");
            a.setAttribute("href", "#");
            a.innerHTML = "Execute This Command";
            exe.appendChild(a);
            var index = temp.id.split("-")[1];
            exe.addEventListener("click", function(event) {
                executeCommand(index);
            }, true);

            document.getElementById("command-grid-menu").childNodes[1].appendChild(exe);
        }
        if (temp.id == "command-grid") {
            inCommandGrid = true;
            break;
        } else temp = temp.parentElement;
    }
    if (inCommandGrid) {
        event.preventDefault();
        $("#command-grid-menu").show();
    };
});


// If the document is clicked somewhere
$(document).bind("mousedown", function(e) {
    if (!$(e.target).parents(".menu").length > 0) $(".menu").hide();
    else setTimeout(function() { $(".menu").hide(); }, 150);
});
