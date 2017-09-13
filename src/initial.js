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

var sideex_wait = {
    next_command_wait: false,
    done: true
};

var sideex_testCase = {
    count: 0
};

var sideex_testSuite = {
    count: 0
};

function clean_panel() {
    document.getElementById("records-grid").innerHTML = "";
    document.getElementById("command-command").value = "";
    document.getElementById("command-target").value = "";
    document.getElementById("command-target-list").innerHTML = "";
    document.getElementById("target-dropdown").innerHTML = "";
    document.getElementById("command-value").value = "";
}
