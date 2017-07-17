function saveNewTarget() {
    var records = getRecordsArray();
    for (var i = 0; i < records.length; ++i) {
        var datalist = records[i].getElementsByTagName("datalist")[0];
        var options = datalist.getElementsByTagName("option");
        var target = getCommandTarget(records[i]);

        if (options.length == 1 && options[0].innerHTML == "") {
            options[0].innerHTML = escapeHTML(target);
        } else { // check whether it is new target
            var new_target = 1;
            for (var j = 0; j < options.length; ++j) {
                if (unescapeHtml(options[j].innerHTML) == target) {
                    new_target = 0;
                    break;
                }
            }

            if (new_target) {
                var new_option = document.createElement("option");
                new_option.innerHTML = escapeHTML(target);
                datalist.appendChild(new_option);
                var x = document.createTextNode("\n        ");
                datalist.appendChild(x);
            }
        }
    }
}

function panelToFile(str) {
    if (!str) {
        return null;
    }
    str = str.replace(/<div style="overflow[\s\S]+?">[\s\S]*?<\/div>/gi, "")
             .replace(/<div style="display[\s\S]+?">/gi, "")
             .replace(/<\/div>/gi, "")
             .replace(/<input[\s\S]+?>/, "")
             .replace(/<tr[\s\S]+?>/gi, "<tr>");
    
    var tr = str.match(/<tr>[\s\S]*?<\/tr>/gi);
    temp_str = str;
    console.log(temp_str);
    str = "\n";
    for (var i = 0; i < tr.length; ++i) {
        var pattern = tr[i].match(/([\s]*?)(?:<td>)([\s\S]*?)(?:<\/td>)([\s]*?)(?:<td>)([\s\S]*?)(?:<datalist>)([\s\S]*?)(?:<\/datalist><\/td>)([\s]*?)(?:<td>)([\s\S]*?)(?:<\/td>)/);

        if (!pattern) {
            str = temp_str;
            break;
        }

        var option = pattern[5].match(/<option>[\s\S]*?<\/option>/gi);
        
        if (!pattern[4].match(/\n/)) {
            pattern[4] = pattern[4] + "\n";
        }
        
        str = str + "<tr>" + pattern[1] + "<td>" + pattern[2] + "</td>" + pattern[3] + "<td>" + pattern[4] + "        <datalist>\n";
        for (var j = 0; j < option.length; ++j) {
            option[j] = option[j].replace(/<option>/, "").replace(/<\/option>/, "");
            str = str + "            <option>" + option[j] + "</option>\n";
        }
        str = str + "        </datalist>\n    </td>" + pattern[6] + "<td>" + pattern[7] + "</td>\n</tr>\n";
    }
    str = '<tbody>' + str + '</tbody>';
    return str;
}

var textFile = null,
makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
};

function downloadSuite(s_suite) {
    if (s_suite) {
        var link = document.createElement('a');
        var f_name = sideex_testSuite[s_suite.id].file_name;
        link.setAttribute('download', f_name);

        var cases = s_suite.getElementsByTagName("div"), 
            output = "",
            old_case = getSelectedCase();
        for (var i = 0; i < cases.length; ++i) {
            setSelectedCase(cases[i].id);
            saveNewTarget();
            output = output 
                + '<table cellpadding="1" cellspacing="1" border="1">\n<thead>\n<tr><td rowspan="1" colspan="3">'
                + sideex_testCase[cases[i].id].title
                + '</td></tr>\n</thead>\n' 
                + panelToFile(document.getElementById("records-grid").innerHTML)
                + '</table>\n';
        }
        output = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" '
            + 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:'
            + 'lang="en" lang="en">\n<head>\n\t<meta content="text/html; charset=UTF-8" http-equiv="content-type" />\n\t<title>'
            + sideex_testSuite[s_suite.id].title
            + '</title>\n</head>\n<body>\n'
            + output
            + '</body>\n</html>';

        if (old_case) {
            setSelectedCase(old_case.id);
        } else {
            setSelectedSuite(s_suite.id);
        }

        link.href = makeTextFile(output);
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
            var event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
    } else {
        alert("Choose a test suite to download!");
    }
}

document.getElementById('save-testSuite').addEventListener('click', function (event) {
    event.stopPropagation();
    var s_suite = getSelectedSuite();
    downloadSuite(s_suite);
}, false);
