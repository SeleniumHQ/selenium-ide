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
