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

function setColor(index, state){
    if(typeof(index) == "string"){
        $("#" + index).addClass(state);
    }else {
        var node = document.getElementById("records-" + index);
        node.className = state
    }
}

// according to "ID" to set odd/even class
function classifyRecords(start, end) {
    var i = start, node;
    try{
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
    }catch(e){}

    document.getElementById("records-" + getRecordsNum()).style.borderBottom = "green solid 2px";
}

// according to <tr> array's "order" to reassign id
function reAssignId(start, end) {
    var records = getRecordsArray();
    start = parseInt(start.split("-")[1]);
    end = parseInt(end.split("-")[1]);
    var len = end - start, i;

    if (len > 0) {
        records[end - 1].id = "records-" + end;
        for (i = start; i < start + len; ++i) {
            records[i - 1].id  = "records-" + i;
        }
        classifyRecords(start, end);
    } else if (len < 0) {
        records[end].id = "records-" + (end + 1);
        len *= -1;
        for (i = end + 1; i < end + len; ++i) {
            records[i].id  = "records-" + (i + 1);
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
        node.draggable = "true";

        // sometimes target will be <td> or <tr>        
        // click
        node.addEventListener("click", function(event){        
            // use jquery's API to add and remove class property
            $('#records-grid .selectedRecord').removeClass('selectedRecord');
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

        // right click
        node.addEventListener("contextmenu", function(event){        
            // use jquery's API to add and remove class property
            $('#records-grid .selectedRecord').removeClass('selectedRecord');
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

        // drag n drop
        node.addEventListener("dragstart", function(event){
            event.dataTransfer.setData("recordID", event.target.id);
        }, false);
        node.addEventListener("dragover", function(event){
            event.preventDefault();
        }, false);
        // node.addEventListener("dragenter", function(event){
        //     var ref = event.target.parentNode;
        //     if (ref.tagName != "TR") {
        //         ref = ref.parentNode;
        //     }
        //     ref.style.borderBottom = "dashed 2px black";
        // }, false);
        node.addEventListener("dragleave", function(event){
            var ref = event.target.parentNode;
            if (ref.tagName != "TR") {
                ref = ref.parentNode;
            }
            // ref.style.borderBottom = "";
            document.getElementById("records-" + getRecordsNum()).style.borderBottom = "green solid 2px";
        }, false);
        node.addEventListener("drop", function(event){
            event.preventDefault();
            var ref = event.target.parentNode;
            if (ref.tagName != "TR") {
                ref = ref.parentNode;
            }
            var end_ID = ref.id,
                start_ID = event.dataTransfer.getData("recordID");
            // ref.style.borderBottom = "";
            
            if (start_ID != end_ID) {
                document.getElementById("records-" + getRecordsNum()).style.borderBottom = "";
                // remove textNode, and last record do not have textNode
                if (document.getElementById(start_ID).nextSibling) {
                    ref.parentNode.removeChild(document.getElementById(start_ID).nextSibling);
                }
                ref.parentNode.insertBefore(document.getElementById(start_ID), ref.nextSibling);
                ref.parentNode.insertBefore(document.createTextNode("\n"), ref.nextSibling);
                reAssignId(start_ID, end_ID);

                $('#records-grid .selectedRecord').removeClass('selectedRecord');
                $('#' + ref.nextSibling.nextSibling.id).addClass('selectedRecord');
                // do not forget that textNode is also a node
                document.getElementById("command-command").value = getCommandName(ref.nextSibling.nextSibling);
                document.getElementById("command-target").value = getCommandTarget(ref.nextSibling.nextSibling);
                document.getElementById("command-value").value = getCommandValue(ref.nextSibling.nextSibling);

                // store command grid to testCase
                var s_case = getSelectedCase();
                if (s_case) {
                    sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
                }
            }
        }, false);
    }
}