function fileToPanel(f) {
    // set records
    var output = f.match(/<tbody>[\s\S]+?<\/tbody>/);
    if (!output) {
        return null;
    }
    output = output[0]
        .replace(/<tbody>/, "")
        .replace(/<\/tbody>/, "");
    var tr = output.match(/<tr>[\s\S]*?<\/tr>/gi);
    output = "";
    if (tr)
        for (var i = 0; i < tr.length; ++i) {
            pattern = tr[i].match(/(?:<tr>)([\s]*?)(?:<td>)([\s\S]*?)(?:<\/td>)([\s]*?)(?:<td>)([\s\S]*?)(?:<datalist>)([\s\S]*?)(?:<\/datalist>([\s]*?)<\/td>)([\s]*?)(?:<td>)([\s\S]*?)(?:<\/td>)([\s]*?)(?:<\/tr>)/);
            // remove whitespace
            pattern[4] = pattern[4].slice(0, -9);

            var new_tr = '<tr>' + pattern[1] + '<td><div style="display: none;">' + pattern[2] + '</div><div style="overflow:hidden;height:15px;"></div></td>' + pattern[3] + '<td><div style="display: none;">' + pattern[4] +
                '</div><div style="overflow:hidden;height:15px;"></div>\n        ' + '<datalist>' + pattern[5] + '</datalist>' + pattern[6] + '</td>' +
                pattern[7] + '<td><div style="display: none;">' + pattern[8] + '</div><div style="overflow:hidden;height:15px;"></div></td>' + pattern[9] + '</tr>';

            output = output + new_tr + "\n";

        }
    output = '<input id="records-count" value="' + ((!tr) ? 0 : tr.length) + '" type="hidden">' + output;
    return output;
}

function readCase(f) {
    var grid_content = fileToPanel(f);
    if (grid_content) {
        clean_panel();
        document.getElementById("records-grid").innerHTML = escapeHTML(grid_content);

        var count = getRecordsNum();
        if (count !== '0') {
            reAssignId("records-1", "records-" + count);
            var r = getRecordsArray();
            for (var i = 1; i <= count; ++i) {
                // do not forget that textNode is a childNode
                for (var j = 0; j < 3; ++j) {
                    var node = document.getElementById("records-" + i).getElementsByTagName("td")[j];
                    var adjust = adjustTooLongStr(node.childNodes[0].innerHTML, node.childNodes[1]);
                    adjust = unescapeHtml(adjust);
                    node.childNodes[1].appendChild(document.createTextNode(adjust));
                }
            }
            attachEvent(1, count);
        }
    } else {
        clean_panel();
        // document.getElementById("records-grid").innerHTML = "";
    }

    // append on test grid
    var id = "case" + sideex_testCase.count;
    sideex_testCase.count++;
    var records = document.getElementById("records-grid").innerHTML;
    var case_title = f.match(/(?:<thead>[\s\S]*?<td rowspan="1" colspan="3">)([\s\S]*?)(?:<\/td>)/)[1];
    sideex_testCase[id] = {
        records: records,
        title: case_title
    };
    addTestCase(case_title, id);
}

function readSuite(f) {
    var reader = new FileReader();

    reader.readAsText(f);
    reader.onload = function() {
        var test_suite = reader.result;
        // append on test grid
        var id = "suite" + sideex_testSuite.count;
        sideex_testSuite.count++;
        addTestSuite(f.name.substring(0, f.name.lastIndexOf(".")), id);
        // name is used for download
        sideex_testSuite[id] = {
            file_name: f.name,
            title: f.name.substring(0, f.name.lastIndexOf("."))
        };

        test_case = test_suite.match(/<table[\s\S]*?<\/table>/gi);
        if (test_case) {
            for (var i = 0; i < test_case.length; ++i) {
                readCase(test_case[i]);
            }
        }

        setSelectedSuite(id);
        clean_panel();
        // document.getElementById("records-grid").innerHTML = "";
    };
    reader.onerror = function(e) {
        console.log("Error", e);
    };
}

document.getElementById("load-testSuite-hidden").addEventListener("change", function(event) {
    event.stopPropagation();
    for (var i = 0; i < this.files.length; i++)
        readSuite(this.files[i]);
}, false);

document.getElementById("load-testSuite-show").addEventListener("click", function(event) {
    event.stopPropagation();
    document.getElementById('load-testSuite-hidden').click();
}, false);

document.getElementById("load-testSuite-show-menu").addEventListener("click", function(event) {
    event.stopPropagation();
    document.getElementById('load-testSuite-hidden').click();
}, false);
