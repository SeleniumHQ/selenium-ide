$(document).ready(function() {
    $(".tablesorter").tablesorter();

    $(".site_title").click(function() {
        browser.tabs.create({
            url: "http://sideex.org/",
            windowId: userWinId
        });
    });

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

    $("#command-grid").colResizable({ liveDrag: true, minWidth: 75 });
    $(function() {
        $.fn.fixMe = function() {
            return this.each(function() {
                var $this = $(this),
                    $t_fixed;

                function init() {
                    $this.wrap('<div class="container" />');
                    $t_fixed = $this.clone();
                    $t_fixed.find("tbody").remove().end().addClass("fixed").insertBefore($this);
                    $t_fixed.find("th").each(function(index) {
                        var $self = $(this);
                        $this.find("th").eq(index).bind("DOMAttrModified", function(e) {
                            $self.css("width", $(this).innerWidth() + "px");
                        });
                    });
                    resizeFixed();
                }

                function resizeFixed() {
                    $t_fixed.find("th").each(function(index) {
                        $(this).css("width", $this.find("th").eq(index).innerWidth() + "px");
                    });
                }

                function scrollFixed() {
                    var offset = $(this).scrollTop(),
                        tableOffsetTop = $this.offset().top,
                        tableOffsetBottom = tableOffsetTop + $this.height() - $this.find("thead").height();
                    if (offset < tableOffsetTop || offset > tableOffsetBottom) {
                        $t_fixed.hide();
                    } else if (offset >= tableOffsetTop && offset <= tableOffsetBottom && $t_fixed.is(":hidden")) {
                        $t_fixed.show();
                    }
                    var tboffBottom = (parseInt(tableOffsetBottom));
                    var tboffTop = (parseInt(tableOffsetTop));

                    if (offset >= tboffBottom && offset <= tableOffsetBottom) {
                        $t_fixed.find("th").each(function(index) {
                            $(this).css("width", $this.find("th").eq(index).outerWidth() + "px");
                        });
                    }
                }
                $(window).resize(resizeFixed);
                $(window).scroll(scrollFixed);
                init();
            });
        };

        $("table").fixMe();
    });

    $(".fixed").width($("table:not(.fixed)").width());

    $("#command-dropdown,#command-command-list").html(genCommandDatalist());

    $(".record-bottom").click(function() { 
        $(this).addClass("active");
        $('#records-grid .selectedRecord').removeClass('selectedRecord'); 
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

function closeConfirm(bool) {
    console.log("closeConfirm", bool);
    if (bool) {
        $(window).bind("beforeunload", function(e) {
            var confirmationMessage = "You have a modified suite!";
            e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
            return confirmationMessage; // Gecko, WebKit, Chrome <34
        });
    } else {
        console.log($("#testCase-grid").find(".modified").length, !$("#testCase-grid").find(".modified").length);
        if (!$("#testCase-grid").find(".modified").length)
            $(window).unbind("beforeunload");
    }
}

function genCommandDatalist() {
    var supportedCommand = [
        "answerOnNextPrompt",
        "chooseCancelOnNextPrompt",
        "chooseCancelOnNextConfirmation",
        "chooseOkOnNextConfirmation",
        "clickAt",
        "doubleClickAt",
        "dragAndDrop",
        "dragAndDropToObject",
        "mouseDownAt",
        "mouseMoveAt",
        "mouseOut",
        "mouseOver",
        "mouseUpAt",
        "sendKeys",
        "type",
        "editContent",
        "select",
        "addSelection",
        "removeSelection",
        "pause",
        "selectFrame",
        "selectWindow",
        "open",
        "storeText",
        "storeTitle",
        "store",
        "runScript",
        "verifyText",
        "verifyTitle",
        "assertAlert",
        "assertConfirmation",
        "assertText",
        "assertTitle",
        "assertPrompt"
    ];

    var datalistHTML = "";
    supportedCommand.forEach(function(command) {
        datalistHTML += ('<option value="' + command + '">' + command + '</option>\n');
    });

    return datalistHTML;
}
