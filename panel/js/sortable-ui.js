// set testsuite and record-grid sortable
$(document).ready(function() {
    console.log("set sortable");
    $("#records-grid").sortable({
        axis: "y",
        items: "tr",
        scroll: true,
        revert: 200,
        scrollSensitivity: 20,
        connectWith: "#records-grid",
        helper: function(e, tr) {
            var $originals = tr.children();
            var $helper = tr.clone();
            $helper.children().each(function(index) {
                $(this).width($originals.eq(index).width());
            });
            return $helper;
        },
        update: function(event, ui) {
            getSelectedCase().classList.add("modified");
            getSelectedSuite().getElementsByTagName("strong")[0].classList.add("modified");
            closeConfirm(true);
        }
    });

    $("#testCase-container").sortable({
        axis: "y",
        handle: "strong",
        items: ".message",
        scroll: true,
        revert: 300,
        scrollSensitivity: 20,
        start: function(event, ui) {
            ui.placeholder.height(ui.item.height());
        }
    });
});

// make case sortable when addTestSuite
function makeCaseSortable(suite) {
    var prevSuite = null;
    $(suite).sortable({
        axis: "y",
        items: "p",
        scroll: true,
        revert: 300,
        scrollSensitivity: 20,
        connectWith: ".message",
        start: function(event, ui) {
            ui.placeholder.html(ui.item.html()).css({ "visibility": "visible", "opacity": 0.3 });
            prevSuite = event.target;
        },
        update: function(event, ui) {
            if(prevSuite!==event.target)
                $(prevSuite).find("strong").addClass("modified");
            $(event.target).find("strong").addClass("modified");
            closeConfirm(true);
        }
    });
}
