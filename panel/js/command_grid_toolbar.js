/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

function getSelectedCase() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedCase")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedCase")[0];
    } else {
        return null;
    }
}

function getSelectedRecord() {
    var selectedNode = document.getElementById("records-grid").getElementsByClassName("selectedRecord");
    if (selectedNode.length) {
        return selectedNode[0].id;
    } else {
        return "";
    }
}

function getStringLengthInPx(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    d.style = "position:absolute;visibility:hidden;";
    d.id = "d_getpx";
    document.body.appendChild(d);
    var px = document.getElementById("d_getpx").clientWidth;
    document.body.removeChild(document.getElementById("d_getpx"));
    return px;
}

function adjustTooLongStr(str, node) {
    var l = str.length;

    while (getStringLengthInPx(str) + 12 > node.clientWidth) {
        str = str.slice(0, -1);
    }
    if (str.length < l) {
        str = str + "..........";
    }
    return str;
}

function addCommand(command_name, command_target_array, command_value, auto, insertCommand) {
    // create default test suite and case if necessary
    var s_suite = getSelectedSuite(),
        s_case = getSelectedCase();
    if (!s_suite || !s_case) {
        var id = "case" + sideex_testCase.count;
        sideex_testCase.count++;
        addTestCase("Untitled Test Case", id);
    }

    // mark modified
    getSelectedCase().classList.add("modified");
    getSelectedSuite().getElementsByTagName("strong")[0].classList.add("modified");
    closeConfirm(true);
    
    // create tr node     
    var new_record = document.createElement("tr");
    new_record.setAttribute("class", "");
    new_record.setAttribute("style", "");
    new_record.appendChild(document.createTextNode("\n    "));

    // create td node
    for (var i = 0; i < 3; ++i) {
        var td = document.createElement("td");
        var div_show = document.createElement("div");
        var div_hidden = document.createElement("div");
        div_show.style = "overflow:hidden;height:15px;";
        div_hidden.style = "display:none;";
        new_record.appendChild(td);
        if (i == 0) {
            div_hidden.appendChild(document.createTextNode(command_name));
            new_record.appendChild(document.createTextNode("\n    "));
        } else if (i == 1) {
            // use textNode to avoid tac's tag problem (textNode's content will be pure text, does not be parsed as html)
            div_hidden.appendChild(document.createTextNode(command_target_array[0][0]));
            new_record.appendChild(document.createTextNode("\n    "));
        } else {
            div_hidden.appendChild(document.createTextNode(command_value));
            new_record.appendChild(document.createTextNode("\n"));
        }
        td.appendChild(div_hidden);
        td.appendChild(div_show);
    }

    // append datalist to target
    var targets = document.createElement("datalist");
    for (var m = 0; m < command_target_array.length; ++m) {
        var option = document.createElement("option");
        // use textNode to avoid tac's tag problem (textNode's content will be pure text, does not be parsed as html)
        option.appendChild(document.createTextNode(command_target_array[m][0]));
        option.innerText=command_target_array[m][0];
        targets.appendChild(option);
    }
    new_record.getElementsByTagName("td")[1].appendChild(targets);

    var selected_ID = getSelectedRecord();
    var count = parseInt(getRecordsNum()) + 1;
    document.getElementById("records-count").value = count;
    if (count != 1) {
        // remove green line
        // document.getElementById("records-" + (count - 1)).style = "";
    }
    if (selected_ID) {
        if (auto) {
            document.getElementById(selected_ID).parentNode.insertBefore(new_record, document.getElementById(selected_ID));
            selected_ID = parseInt(selected_ID.split("-")[1]);
        } else {
            document.getElementById(selected_ID).parentNode.insertBefore(new_record, document.getElementById(selected_ID).nextSibling);
            selected_ID = parseInt(selected_ID.split("-")[1]) + 1;
        }
        reAssignId("records-" + selected_ID, "records-" + count);
        attachEvent(selected_ID, selected_ID);
        if (auto) {
            selected_ID = "#records-" + (selected_ID + 1);
            $(selected_ID).addClass('selectedRecord');
        }
    } else {
        if (insertCommand) {
            document.getElementById("records-grid").insertBefore(new_record, getRecordsArray()[getRecordsNum()-2]);
        } else {
            document.getElementById("records-grid").appendChild(new_record);
        }
        reAssignId("records-1", "records-" + count);
        attachEvent(1, count);

        // focus on new element
        document.getElementById("records-" + count).scrollIntoView();
    }
    if (auto) {
        new_record.parentNode.insertBefore(document.createTextNode("\n"), new_record.nextSibling);
    } else {
        new_record.parentNode.insertBefore(document.createTextNode("\n"), new_record);
    }

    // set div_show's innerHTML here, because we need div's clientWidth 
    for (var k = 0; k < 3; ++k) {
        var tooLongStr;
        if (k == 0) {
            tooLongStr = command_name;
        } else if (k == 1) {
            tooLongStr = command_target_array[0][0];
        } else {
            tooLongStr = command_value;
        }
        var adjust = adjustTooLongStr(tooLongStr, getTdShowValueNode(new_record, k));
        getTdShowValueNode(new_record, k).appendChild(document.createTextNode(adjust));
    }

    // store command grid to testCase
    var s_case = getSelectedCase();
    if (s_case) {
        sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
    }
}

// add command manually (append downward)
function addCommandManu(command_name, command_target_array, command_value) {
    addCommand(command_name, command_target_array, command_value, 0, false);
}

// add command before last command (append upward)
function addCommandBeforeLastCommand(command_name, command_target_array, command_value) {
    addCommand(command_name, command_target_array, command_value, 0, true);
}

// add command automatically (append upward)
function addCommandAuto(command_name, command_target_array, command_value) {
    addCommand(command_name, command_target_array, command_value, 1, false);
}

$("#command-command").on("input", function(event) {
    var temp = getSelectedRecord();
    if (temp) {
        var div = getTdRealValueNode(document.getElementById(temp), 0);
        // set innerHTML = ""
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(event.target.value));

        var command_command = event.target.value;
        div = getTdShowValueNode(document.getElementById(temp), 0);
        var command_command_adjust = adjustTooLongStr(command_command, div);
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(command_command_adjust));

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
        }
    }
});

$("#command-target").on("input", function(event) {
    var temp = getSelectedRecord();
    if (temp) {
        var div = getTdRealValueNode(document.getElementById(temp), 1);
        // set innerHTML = ""
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(event.target.value));

        var command_target = event.target.value;
        div = getTdShowValueNode(document.getElementById(temp), 1);
        var command_target_adjust = adjustTooLongStr(command_target, div);
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(command_target_adjust));

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
        }
    }
});
$("#command-value").on("input", function(event) {
    var temp = getSelectedRecord();
    if (temp) {
        var div = getTdRealValueNode(document.getElementById(temp), 2);
        // set innerHTML = ""
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(event.target.value));

        var command_value = event.target.value;
        div = getTdShowValueNode(document.getElementById(temp), 2);
        var command_value_adjust = adjustTooLongStr(command_value, div);
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(command_value_adjust));

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
        }
    }
});

document.getElementById("grid-add").addEventListener("click", function() {
    // target is 2-D array
    addCommandManu("", [
        [""]
    ], "");
}, false);

// "delete" command is different from add and reorder
function reAssignIdForDelete(delete_ID, count) {
    var records = getRecordsArray();
    for (var i = delete_ID - 1; i < count; ++i) {
        records[i].id = "records-" + (i + 1);
    }
    classifyRecords(delete_ID, count);
}

document.getElementById("grid-deleteAll").addEventListener("click", function() {
    var selectedNode = document.getElementById("records-grid").getElementsByTagName("TR");
    for(var i=selectedNode.length;i>0;i--){
        deleteCommand("records-" + i);
    }
}, false);

document.getElementById("grid-delete").addEventListener("click", function() {
    deleteCommand(getSelectedRecord());
}, false);

document.addEventListener("keydown", function(e) {
    var keynum;
    if(window.event) // IE
    {
        keynum = e.keyCode
    }
    else if(e.which) // Netscape/Firefox/Opera
    {
        keynum = e.which
    }
    if(keynum === 46){
        deleteCommand(getSelectedRecord());
    }
}, false);

function deleteCommand(selected_ID) {
    if (selected_ID) {
        var delete_node = document.getElementById(selected_ID);
        // do not forget to remove textNode
        if (delete_node.previousSibling.nodeType == 3) {
            delete_node.parentNode.removeChild(delete_node.previousSibling);
        }
        delete_node.parentNode.removeChild(delete_node);

        var count = parseInt(getRecordsNum()) - 1;
        document.getElementById("records-count").value = count;
        selected_ID = parseInt(selected_ID.split("-")[1]);

        // delete last one
        if (selected_ID - 1 != count) {
            reAssignIdForDelete(selected_ID, count);
        } else {
            // if (count != 0) {
            //     document.getElementById("records-" + count).style.borderBottom = "green solid 2px";
            // }
        }

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
        }
    }
}
