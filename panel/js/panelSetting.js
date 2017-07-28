$(document).ready(function() {
    window.addEventListener("beforeunload", function(e) {
        var confirmationMessage = "\o/";

        e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
        console.log(e);
        return confirmationMessage; // Gecko, WebKit, Chrome <34
    });

    $(".tablesorter").tablesorter();

    //init dropdown width
    $("#command-dropdown").css({
        'width': $("#command-command").width() + 29 + "px"
    });
    $("#target-dropdown").css({
        'width': $("#command-target").width() + 29 + "px"
    });
    //dropdown width change with input's width
    $(window).resize(function() {
        $("#command-dropdown").css({
            'width': $("#command-command").width() + 29 + "px"
        });
        $("#target-dropdown").css({
            'width': $("#command-target").width() + 29 + "px"
        });
    });
    //dropdown when click the down icon
    $(".fa-chevron-down").click(function() {
        dropdown($("#" + $(this).attr("id") + "dropdown"));
        $(".w3-show").bind("mouseleave", function() {
            dropdown($(this));
        });
    });
});

var dropdown = function(node) {
    if (!node.hasClass("w3-show")) {
        node.addClass("w3-show");
        setTimeout(function() {
            $(document).bind("click", clickWhenDropdownHandler);
        }, 200);
    } else {
        $(".w3-show").unbind("mouseleave");
        node.removeClass("w3-show");
        $(document).unbind("click", clickWhenDropdownHandler);
    }
};

var clickWhenDropdownHandler = function(e) {
    var event = $(e.target);
    if ($(".w3-show").is(event.parent())) {
        $(".w3-show").prev().prev().val(event.val()).trigger("input");
    }
    dropdown($(".w3-show"));
};
