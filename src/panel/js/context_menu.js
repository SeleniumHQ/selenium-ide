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

// Trigger action when the contexmenu is about to be shown
$(document).bind("contextmenu", function(event) {

    $(".menu").css("left", event.pageX);
    $(".menu").css("top", event.pageY + 25);

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
