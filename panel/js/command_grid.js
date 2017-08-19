// get <tr> array
function getRecordsArray() {
    return document.getElementById("records-grid").getElementsByTagName("tr");
}

function getTdRealValueNode(node, index) {
    return node.getElementsByTagName("td")[index].getElementsByTagName("div")[0];
}

function getTdShowValueNode(node, index) {
    return node.getElementsByTagName("td")[index].getElementsByTagName("div")[1];
}

function getCommandName(tr, for_show) {
    if (for_show) {
        return unescapeHtml(getTdShowValueNode(tr, 0).innerHTML);
    }
    return unescapeHtml(getTdRealValueNode(tr, 0).innerHTML);
}

function getCommandTarget(tr, for_show) {
    if (for_show) {
        return unescapeHtml(getTdShowValueNode(tr, 1).innerHTML);
    }
    return unescapeHtml(getTdRealValueNode(tr, 1).innerHTML);
}

function getCommandValue(tr, for_show) {
    if (for_show) {
        return unescapeHtml(getTdShowValueNode(tr, 2).innerHTML);
    }
    return unescapeHtml(getTdRealValueNode(tr, 2).innerHTML);
}

function getRecordsNum() {
    return document.getElementById("records-count").value;
}

function setColor(index, state) {
    if (typeof(index) == "string") {
        $("#" + index).addClass(state);
    } else {
        var node = document.getElementById("records-" + index);
        node.className = state;
        setRecordScrollTop(node);
    }
}

function setRecordScrollTop(record) {
    if ($(".smallSection").scrollTop() > record.offsetTop - 65)
        $(".smallSection").animate({
            scrollTop: record.offsetTop - 65
        }, 200);
    else if ($(".smallSection").height() + $(".smallSection").scrollTop() - 55 < record.offsetTop)
        $(".smallSection").animate({
            scrollTop: record.offsetTop - ($(".smallSection").height() - 55)
        }, 200);
}

function setCaseScrollTop(testCase) {
    if ($(".case_list").scrollTop() > testCase.offsetTop - 143)
        $(".case_list").animate({
            scrollTop: testCase.offsetTop - 143
        }, 200);
    else if ($(".case_list").height() + $(".case_list").scrollTop() - 60 < testCase.offsetTop - $(".case_list").offset().top)
        $(".case_list").animate({
            scrollTop: testCase.offsetTop - $(".case_list").offset().top - ($(".case_list").height() - 60)
        }, 600);
}

// according to "ID" to set odd/even class
function classifyRecords(start, end) {
    var i = start,
        node;
    try {
        if (i % 2 == 1) {
            while (i <= end) {
                node = document.getElementById("records-" + i);
                if (!node.className || node.className == "odd" || node.className == "even") {
                    node.className = "odd";
                }
                i = parseInt(i) + 1;
                node = document.getElementById("records-" + i);
                if (!node.className || node.className == "odd" || node.className == "even") {
                    node.className = "even";
                }
                i = parseInt(i) + 1;
            }
        } else {
            while (i <= end) {
                node = document.getElementById("records-" + i);
                if (!node.className || node.className == "odd" || node.className == "even") {
                    node.className = "even";
                }
                i = parseInt(i) + 1;
                node = document.getElementById("records-" + i);
                if (!node.className || node.className == "odd" || node.className == "even") {
                    node.className = "odd";
                }
                i = parseInt(i) + 1;
            }
        }
    } catch (e) {}

    // document.getElementById("records-" + getRecordsNum()).style.borderBottom = "green solid 2px";
}

// according to <tr> array's "order" to reassign id
function reAssignId(start, end) {
    var records = getRecordsArray();
    start = parseInt(start.split("-")[1]);
    end = parseInt(end.split("-")[1]);
    var len = end - start,
        i;

    if (len > 0) {
        records[end - 1].id = "records-" + end;
        for (i = start; i < start + len; ++i) {
            records[i - 1].id = "records-" + i;
        }
        classifyRecords(start, end);
    } else if (len < 0) {
        records[end].id = "records-" + (end + 1);
        len *= -1;
        for (i = end + 1; i < end + len; ++i) {
            records[i].id = "records-" + (i + 1);
        }
        classifyRecords(end, start);
    } else {
        records[start - 1].id = "records-" + start;
        classifyRecords(start, end);
    }
}

function getSelectedCase() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedCase")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedCase")[0];
    } else {
        return null;
    }
}

// attach event on <tr> (records)
function attachEvent(start, end) {
    for (var i = start; i <= end; ++i) {
        var node = document.getElementById("records-" + i);

        // sometimes target will be <td> or <tr>        
        // click
        node.addEventListener("click", function(event) {
            // use jquery's API to add and remove class property
            $('#records-grid .selectedRecord').removeClass('selectedRecord');
            $(".record-bottom").removeClass("active");
            $(this).addClass('selectedRecord');

            // show on grid toolbar
            var ref = event.target.parentNode;
            if (ref.tagName != "TR") {
                ref = ref.parentNode;
            }

            // notice that "textNode" also is a node
            document.getElementById("command-command").value = getCommandName(ref);
            document.getElementById("command-target").value = getCommandTarget(ref);
            document.getElementById("target-dropdown").innerHTML = escapeHTML(ref.getElementsByTagName("td")[1].getElementsByTagName("datalist")[0].innerHTML);
            document.getElementById("command-target-list").innerHTML = escapeHTML(ref.getElementsByTagName("td")[1].getElementsByTagName("datalist")[0].innerHTML);
            document.getElementById("command-value").value = getCommandValue(ref);
        }, false);

        // right click
        node.addEventListener("contextmenu", function(event) {
            // use jquery's API to add and remove class property
            $('#records-grid .selectedRecord').removeClass('selectedRecord');
            $(".record-bottom").removeClass("active");
            $(this).addClass('selectedRecord');

            // show on grid toolbar
            var ref = event.target.parentNode;
            if (ref.tagName != "TR") {
                ref = ref.parentNode;
            }

            // notice that "textNode" also is a node
            document.getElementById("command-command").value = getCommandName(ref);
            document.getElementById("command-target").value = getCommandTarget(ref);
            document.getElementById("command-target-list").innerHTML = escapeHTML(ref.getElementsByTagName("td")[1].getElementsByTagName("datalist")[0].innerHTML);
            document.getElementById("command-value").value = getCommandValue(ref);
        }, false);
    }
}
