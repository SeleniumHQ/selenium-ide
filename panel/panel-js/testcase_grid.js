function cleanSelected() {
    // use jquery's API to add and remove class property
    $('#testCase-grid .selectedCase').removeClass('selectedCase');
    $('#testCase-grid .selectedSuite').removeClass('selectedSuite');
}

function setSelectedSuite(id) {
    saveOldCase();
    cleanSelected();
    $("#" + id).addClass('selectedSuite');
    clean_panel();
    // document.getElementById("records-grid").innerHTML = "";
}

function setSelectedCase(id) {
    saveOldCase();
    var suite_id = document.getElementById(id).parentNode.id;
    setSelectedSuite(suite_id);
    $("#" + id).addClass('selectedCase');
    clean_panel();
    document.getElementById("records-grid").innerHTML = escapeHTML(sideex_testCase[id].records); 
}

function getSelectedSuite() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedSuite")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedSuite")[0];    
    } else {
        return null;
    }
}

function getSelectedCase() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedCase")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedCase")[0];    
    } else {
        return null;
    }
}

function saveOldCase() {
    var old_case = getSelectedCase();
    if (old_case) {
        sideex_testCase[old_case.id].records = document.getElementById("records-grid").innerHTML;
    }
}

function appendContextMenu(node, isCase) {
    var ul = document.createElement("ul");
    var a;

    var open_suite = document.createElement("li");
    a = document.createElement("a");
    a.setAttribute("href", "#");
    a.innerHTML = "Open Test Suites";
    open_suite.appendChild(a);
    open_suite.addEventListener("click", function(event){
        event.stopPropagation();
        document.getElementById('load-testSuite-hidden').click();
    }, false);
    ul.appendChild(open_suite);

    var save_suite = document.createElement("li");
    a = document.createElement("a");
    a.setAttribute("href", "#");
    a.innerHTML = "Save Test Suite As...";
    save_suite.appendChild(a);
    save_suite.addEventListener("click", function(event){
        event.stopPropagation();
        document.getElementById('save-testSuite').click();
    }, false);
    ul.appendChild(save_suite);

    var add_suite = document.createElement("li");
    a = document.createElement("a");
    a.setAttribute("href", "#");
    a.innerHTML = "Add New Test Suite";
    add_suite.appendChild(a);
    add_suite.addEventListener("click", function(event){
        event.stopPropagation();
        document.getElementById("add-testSuite").click();
    }, false);
    ul.appendChild(add_suite);

    var close_suite = document.createElement("li");
    a = document.createElement("a");
    a.setAttribute("href", "#");
    a.innerHTML = "Close Test Suite";
    close_suite.appendChild(a);
    close_suite.addEventListener("click", function(event){
        event.stopPropagation();
        document.getElementById('close-testSuite').click();
    }, false);
    ul.appendChild(close_suite);              

    var add_case = document.createElement("li");
    a = document.createElement("a");
    a.setAttribute("href", "#");
    a.innerHTML = "Add New Test Case";
    add_case.appendChild(a);
    add_case.addEventListener("click", function(event){
        event.stopPropagation();
        document.getElementById('add-testCase').click();
    }, false);
    ul.appendChild(add_case);  

    if (isCase) {
        var remove_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.innerHTML = "Remove Test Case";
        remove_case.appendChild(a);
        remove_case.addEventListener("click", function(event){
            event.stopPropagation();
            document.getElementById('delete-testCase').click();
        }, false);
        ul.appendChild(remove_case); 

        var rename_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.innerHTML = "Rename Test Case's Title";
        rename_case.appendChild(a);
        rename_case.addEventListener("click", function(event){
            event.stopPropagation();
            var s_case = getSelectedCase();
            var n_title = prompt("Please enter the Test Case's title", sideex_testCase[s_case.id].title);
            // get text node
            s_case.childNodes[0].textContent = n_title;
            sideex_testCase[s_case.id].title = n_title;
        }, false); 
        ul.appendChild(rename_case);           
    } else {
        var rename_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.innerHTML = "Rename Test Suite's Title";
        rename_suite.appendChild(a);
        rename_suite.addEventListener("click", function(event){
            event.stopPropagation();
            var s_suite = getSelectedSuite();
            var n_title = prompt("Please enter the Test Suite's title", sideex_testSuite[s_suite.id].title);
            // get text node
            s_suite.childNodes[0].textContent = n_title;
            sideex_testSuite[s_suite.id].title = n_title;
        }, false);
        ul.appendChild(rename_suite); 
    }

    node.appendChild(ul);
}

function addTestCase(title, id) {
    if (!getSelectedSuite()) {
        var suite_id = "suite" + sideex_testSuite.count;
        sideex_testSuite.count++;
        sideex_testSuite[suite_id] = { file_name: "Untitled Test Suite.html", title: "Untitled Test Suite" };
        addTestSuite("Untitled Test Suite", suite_id);
    }

    var div = document.createElement("div");
    div.innerHTML = escapeHTML(title);
    div.setAttribute("id", id);
    div.setAttribute("draggable", true);
    div.setAttribute("contextmenu", "menu" + id);

    var s_case = getSelectedCase();
    if (s_case) {
        s_case.parentNode.insertBefore(div, s_case.nextSibling);
    } else {
        getSelectedSuite().appendChild(div);
    }
    
    cleanSelected();
    div.setAttribute("class", "selectedCase");
    div.parentNode.setAttribute("class", "selectedSuite");

    if (sideex_testCase[id]) { // load file
        clean_panel();
        document.getElementById("records-grid").innerHTML = escapeHTML(sideex_testCase[id].records);
        if (sideex_testCase[id].records) {
            reAssignId("records-1", "records-" + getRecordsNum());
            attachEvent(1, getRecordsNum());
        }
    } else { // add new testCase
        clean_panel();
        document.getElementById("records-grid").innerHTML = escapeHTML('<input id="records-count" type=hidden value=0></input>');
        sideex_testCase[id] = {
            records: "",
            title: title
        };
    }    

    // attach event
    div.addEventListener("click", function(event){
        event.stopPropagation();
        saveOldCase();
        // use jquery's API to add and remove class property
        cleanSelected();
        $("#" + event.target.id).addClass("selectedCase");
        event.target.parentNode.setAttribute("class", "selectedSuite");

        if (sideex_testCase[event.target.id].records) {
            clean_panel();
            document.getElementById("records-grid").innerHTML = escapeHTML(sideex_testCase[event.target.id].records);
            reAssignId("records-1", "records-" + getRecordsNum());
            attachEvent(1, getRecordsNum());
        } else {
            clean_panel();
            document.getElementById("records-grid").innerHTML = escapeHTML('<input id="records-count" type=hidden value=0></input>');
        }
        // prevent event trigger on parent from child
        event.stopPropagation();
    }, false);
    div.addEventListener("dragstart", function(event){
        event.stopPropagation();
        saveOldCase();
        event.dataTransfer.setData("testCase", event.target.id);
    }, false);
    div.addEventListener("dragover", function(event){
        event.stopPropagation();
        event.preventDefault();
    }, false);
    div.addEventListener("drop", function(event){
        event.stopPropagation();
        event.preventDefault();
        saveOldCase();
        var start_ID = event.dataTransfer.getData("testCase"), 
            end_ID = event.target.id;
        if (end_ID !== start_ID && (end_ID.slice(0,1) == start_ID.slice(0,1))) {
            event.target.parentNode.insertBefore(document.getElementById(start_ID), event.target.nextSibling);
            cleanSelected();
            $("#" + event.target.nextSibling.id).addClass("selectedCase");
            event.target.parentNode.setAttribute("class", "selectedSuite");
        }
    }, false);


    var menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "menu" + id);
    appendContextMenu(menu, true);
    document.body.appendChild(menu);

    // right click
    div.addEventListener("contextmenu", function(event){
        event.preventDefault();
        event.stopPropagation();
        saveOldCase();
        setSelectedCase(event.target.id);
        var mid = "#" + "menu" + id;
        console.log($(mid));
        $(".menu").css("left",event.pageX);
        $(".menu").css("top",event.pageY);
        $(mid).show();
    }, false);
}

function addTestSuite(title, id) {
    var div = document.createElement("div");
    div.innerHTML = escapeHTML(title);
    div.setAttribute("id", id);
    div.setAttribute("draggable", true);
    div.setAttribute("contextmenu", "menu" + id);


    var s_suite = getSelectedSuite();
    if (s_suite) {
        s_suite.parentNode.insertBefore(div, s_suite.nextSibling);
    } else {
        document.getElementById("testCase-grid").appendChild(div);
    }

    cleanSelected();
    div.setAttribute("class", "selectedSuite");

    // attach event
    div.addEventListener("click", function(event){
        event.stopPropagation();
        saveOldCase();
        cleanSelected();
        event.target.setAttribute("class", "selectedSuite");
        clean_panel();
        // document.getElementById("records-grid").innerHTML = "";
    }, false);
    div.addEventListener("dragstart", function(event){
        event.stopPropagation();
        saveOldCase();
        event.dataTransfer.setData("testSuite", event.target.id);
    }, false);
    div.addEventListener("dragover", function(event){
        event.stopPropagation();
        event.preventDefault();
    }, false);
    div.addEventListener("drop", function(event){
        event.stopPropagation();
        event.preventDefault();
        saveOldCase();
        var start_ID = event.dataTransfer.getData("testSuite"), 
            end_ID = event.target.id;
        if (end_ID !== start_ID && (end_ID.slice(0,1) == start_ID.slice(0,1))) {
            event.target.parentNode.insertBefore(document.getElementById(start_ID), event.target.nextSibling);
            cleanSelected();
            document.getElementById(start_ID).setAttribute("class", "selectedSuite");
        }
    }, false);

    var menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "menu" + id);
    appendContextMenu(menu, false);
    document.body.appendChild(menu);

    // right click
    div.addEventListener("contextmenu", function(event){
        event.preventDefault();
        event.stopPropagation();
        saveOldCase();
        setSelectedSuite(event.target.id);
        var mid = "#" + "menu" + id;
        console.log($(mid));
        $(".menu").css("left",event.pageX);
        $(".menu").css("top",event.pageY);
        $(mid).show();
    }, false);
}

document.getElementById("add-testSuite").addEventListener("click", function(event){
    event.stopPropagation();
    var title = prompt("Please enter the Test Suite's title");
    if (!title) {
        title = "Untitled Test Case";
    }
    var id = "suite" + sideex_testSuite.count;
    sideex_testSuite.count++;
    sideex_testSuite[id] = { file_name: title + ".html", title: title };
    addTestSuite(title, id);
}, false);

document.getElementById("add-testSuite-menu").addEventListener("click", function(event){
    event.stopPropagation();
    document.getElementById('add-testSuite').click();
}, false);

document.getElementById("close-testSuite").addEventListener('click', function (event) {
    event.stopPropagation();
    var s_suite = getSelectedSuite();
    if (s_suite) {
        sideex_testSuite[s_suite.id] = null;
        s_suite.parentNode.removeChild(s_suite);
        clean_panel();
        // document.getElementById("records-grid").innerHTML = "";
    }
}, false);

document.getElementById("add-testCase").addEventListener("click", function(event){
    var title = prompt("Please enter the Test Case's title");
    if (!title) {
        title = "Untitled Test Case";
    }
    var id = "case" + sideex_testCase.count;
    sideex_testCase.count++;
    addTestCase(title, id);
}, false);

document.getElementById("delete-testCase").addEventListener('click', function () {
    var s_case = getSelectedCase();
    if (s_case) {
        sideex_testCase[s_case.id] = null;
        s_case.parentNode.removeChild(s_case);
        clean_panel();
        // document.getElementById("records-grid").innerHTML = "";
    }
}, false);
