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

// change HTML entities to sign
function unescapeHtml(str) {
    return str
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#39;/gi, "'");
}

function escapeAttr(str) {
    var spaceS = 0;
    var spaceE = -1;
    var tempStr = str;
    var tempAttr = "";
    var tempValue = "";
    var processedTag = "";
    var flag = false;

    do {
        spaceS = str.indexOf(" ");
        spaceE = str.indexOf(" ", spaceS + 1);

        if (spaceE >= 0) {
            while (str.charAt(spaceE - 1) != "\'" && str.charAt(spaceE - 1) != "\"") {
                spaceE = str.indexOf(" ", spaceE + 1);
                if (spaceE < 0)
                    break;
            }
        }

        //if there is space, then split string
        if (spaceS >= 0 && spaceE >= 0) {
            tempAttr = str.substring(spaceS + 1, spaceE);
            tempStr = str.substring(0, spaceS + 1);
            str = str.substring(spaceE);
        } else if (spaceS >= 0 && spaceE < 0) {
            tempAttr = str.substring(spaceS + 1, str.length - 1);
            tempStr = str.substring(0, spaceS + 1);
            str = "";
        } else {
            //flag is check that has string been processed
            if (flag)
                processedTag += ">";
            else
                processedTag = str;
            break;
        }

        flag = true;
        var equal = tempAttr.indexOf("=");

        if (tempAttr.charAt(equal + 1) == "\'") {
            //divide the single quote
            if (tempAttr.indexOf("\'") != -1) {
                var quotS = tempAttr.indexOf("\'");
                var quotE = tempAttr.lastIndexOf("\'");
                tempValue = tempAttr.substring(quotS + 1, quotE);
                tempAttr = tempAttr.substring(0, quotS + 1);
                tempValue = replaceChar(tempValue);
                tempAttr += tempValue + "\'";
            }
        }
        if (tempAttr.charAt(equal + 1) == "\"") {
            //divide the double quote
            if (tempAttr.indexOf("\"") != -1) {
                var dquotS = tempAttr.indexOf("\"");
                var dquotE = tempAttr.lastIndexOf("\"");
                tempValue = tempAttr.substring(dquotS + 1, dquotE);
                tempAttr = tempAttr.substring(0, dquotS + 1);
                tempValue = replaceChar(tempValue);
                tempAttr += tempValue + "\"";
            }
        }
        //merge the splited string
        processedTag += tempStr + tempAttr;
    } while (true)

    return processedTag;
};

//escape the character "<".">"."&"."'".'"'
function doEscape(str) {
    return str.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
}

//append
function checkType(cutStr, replaceStr, mode) {
    switch (mode) {
        case 1:
            return cutStr += replaceStr + "&amp;";
            break;
        case 2:
            return cutStr += replaceStr + "&quot;";
            break;
        case 3:
            return cutStr += replaceStr + "&#39;";
            break;
        case 4:
            return cutStr += replaceStr + "&lt;";
            break;
        case 5:
            return cutStr += replaceStr + "&gt;";
            break;
        default:
            return cutStr;
            break;
    }
}

//avoid &amp; to escape &amp;amp;
function replaceChar(str) {
    //escape the character
    var pos = -1;
    var cutStr = "";
    var replaceStr = "";
    var doFlag = 0;
    var charType;

    while (true) {
        pos = str.indexOf("&", pos + 1);
        charType = 0;
        if (pos != -1) {
            if (str.substring(pos, pos + 5) == "&amp;") {
                charType = 1;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 5);
            } else if (str.substring(pos, pos + 6) == "&quot;") {
                charType = 2;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 6);
            } else if (str.substring(pos, pos + 5) == "&#39;") {
                charType = 3;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 5);
            } else if (str.substring(pos, pos + 4) == "&lt;") {
                charType = 4;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 4);
            } else if (str.substring(pos, pos + 4) == "&gt;") {
                charType = 5;
                replaceStr = str.substring(0, pos);
                str = str.substring(pos + 4);
            }

            if (charType != 0) {
                //replaceStr = str.substring(0,pos);
                //str = str.substring(pos+5);
                pos = -1;
                //replaceStr = replaceStr.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
                replaceStr = doEscape(replaceStr);
                //cutStr += replaceStr + "&amp;";
                cutStr = checkType(cutStr, replaceStr, charType);
                doFlag = 1;
            }
        } else {
            cutStr += str;
            break;
        }
    }
    if (doFlag == 0)
        //return str.replace(/[&"'<>]/g, (m) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[m]);
        return doEscape(str);
    else
        return cutStr;
}

//check the HTML value
function escapeHTML(str) {
    var smallIndex = str.indexOf("<");
    var greatIndex = str.indexOf(">");
    var tempStr = "";
    var tempTag = "";
    var processed = "";
    var tempSmallIndex = 0;

    while (true) {
        //find the less target
        if (smallIndex >= 0) {
            //find the greater target
            if (greatIndex >= 0) {
                do {
                    //split foreward string
                    smallIndex += tempSmallIndex;
                    tempStr = str.substring(0, smallIndex);
                    //split the tags
                    tempTag = str.substring(smallIndex, greatIndex + 1);
                    tempSmallIndex = tempTag.lastIndexOf("<");

                } while (tempSmallIndex != 0)

                //escape attributes in the tag
                tempTag = escapeAttr(tempTag);

                str = str.substring(greatIndex + 1);
                //check if the tag is script
                // if(tempTag.toLowerCase().indexOf("script")>=0)
                // tempTag = replaceChar(tempTag);

                //merge them up
                processed += replaceChar(tempStr) + tempTag;
            } else {
                replaceChar(str);
                break;
            }
        } else {
            replaceChar(str);
            break;
        }
        //going to do next tag
        smallIndex = str.indexOf("<");
        greatIndex = 0;
        do {
            //avoid other >
            greatIndex = str.indexOf(">", greatIndex + 1);
        } while (greatIndex < smallIndex && greatIndex != -1)
    }

    if (str != "")
        processed += replaceChar(str);

    return processed;
};
