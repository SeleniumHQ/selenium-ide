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
export function unescapeHtml(str) {
  return str
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
}

function escapeAttr(str) {
  let spaceS = 0
  let spaceE = -1
  let tempStr = str
  let tempAttr = ''
  let tempValue = ''
  let processedTag = ''
  let flag = false
  let finishedProcessing = false

  do {
    spaceS = str.indexOf(' ')
    spaceE = str.indexOf(' ', spaceS + 1)

    if (spaceE >= 0) {
      while (str.charAt(spaceE - 1) != "'" && str.charAt(spaceE - 1) != '"') {
        spaceE = str.indexOf(' ', spaceE + 1)
        if (spaceE < 0) break
      }
    }

    //if there is space, then split string
    if (spaceS >= 0 && spaceE >= 0) {
      tempAttr = str.substring(spaceS + 1, spaceE)
      tempStr = str.substring(0, spaceS + 1)
      str = str.substring(spaceE)
    } else if (spaceS >= 0 && spaceE < 0) {
      tempAttr = str.substring(spaceS + 1, str.length - 1)
      tempStr = str.substring(0, spaceS + 1)
      str = ''
    } else {
      //flag is check that has string been processed
      if (flag) processedTag += '>'
      else processedTag = str
      finishedProcessing = true
      break
    }

    flag = true
    let equal = tempAttr.indexOf('=')

    if (tempAttr.charAt(equal + 1) == "'") {
      //divide the single quote
      if (tempAttr.indexOf("'") != -1) {
        let quotS = tempAttr.indexOf("'")
        let quotE = tempAttr.lastIndexOf("'")
        tempValue = tempAttr.substring(quotS + 1, quotE)
        tempAttr = tempAttr.substring(0, quotS + 1)
        tempValue = replaceChar(tempValue)
        tempAttr += tempValue + "'"
      }
    }
    if (tempAttr.charAt(equal + 1) == '"') {
      //divide the double quote
      if (tempAttr.indexOf('"') != -1) {
        let dquotS = tempAttr.indexOf('"')
        let dquotE = tempAttr.lastIndexOf('"')
        tempValue = tempAttr.substring(dquotS + 1, dquotE)
        tempAttr = tempAttr.substring(0, dquotS + 1)
        tempValue = replaceChar(tempValue)
        tempAttr += tempValue + '"'
      }
    }
    //merge the splited string
    processedTag += tempStr + tempAttr
  } while (!finishedProcessing)

  return processedTag
}

//escape the character "<".">"."&"."'".'"'
function doEscape(str) {
  return str.replace(
    /[&"'<>]/g,
    m =>
      ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[
        m
      ])
  )
}

//append
function checkType(cutStr, replaceStr, mode) {
  switch (mode) {
    case 1:
      return (cutStr += replaceStr + '&amp;')
    case 2:
      return (cutStr += replaceStr + '&quot;')
    case 3:
      return (cutStr += replaceStr + '&#39;')
    case 4:
      return (cutStr += replaceStr + '&lt;')
    case 5:
      return (cutStr += replaceStr + '&gt;')
    default:
      return cutStr
  }
}

//avoid &amp; to escape &amp;amp;
function replaceChar(str) {
  //escape the character
  let pos = -1
  let cutStr = ''
  let replaceStr = ''
  let doFlag = 0
  let charType
  let ampersandExists = true

  while (ampersandExists) {
    pos = str.indexOf('&', pos + 1)
    charType = 0
    if (pos != -1) {
      if (str.substring(pos, pos + 5) == '&amp;') {
        charType = 1
        replaceStr = str.substring(0, pos)
        str = str.substring(pos + 5)
      } else if (str.substring(pos, pos + 6) == '&quot;') {
        charType = 2
        replaceStr = str.substring(0, pos)
        str = str.substring(pos + 6)
      } else if (str.substring(pos, pos + 5) == '&#39;') {
        charType = 3
        replaceStr = str.substring(0, pos)
        str = str.substring(pos + 5)
      } else if (str.substring(pos, pos + 4) == '&lt;') {
        charType = 4
        replaceStr = str.substring(0, pos)
        str = str.substring(pos + 4)
      } else if (str.substring(pos, pos + 4) == '&gt;') {
        charType = 5
        replaceStr = str.substring(0, pos)
        str = str.substring(pos + 4)
      }

      if (charType != 0) {
        pos = -1
        replaceStr = doEscape(replaceStr)
        cutStr = checkType(cutStr, replaceStr, charType)
        doFlag = 1
      }
    } else {
      cutStr += str
      ampersandExists = false
    }
  }
  if (doFlag == 0) return doEscape(str)
  else return cutStr
}

//check the HTML value
export function escapeHTML(str) {
  let smallIndex = str.indexOf('<')
  let greatIndex = str.indexOf('>')
  let tempStr = ''
  let tempTag = ''
  let processed = ''
  let tempSmallIndex = 0
  let tagsExists = true

  while (tagsExists) {
    //find the less target
    if (smallIndex >= 0) {
      //find the greater target
      if (greatIndex >= 0) {
        do {
          //split foreward string
          smallIndex += tempSmallIndex
          tempStr = str.substring(0, smallIndex)
          //split the tags
          tempTag = str.substring(smallIndex, greatIndex + 1)
          tempSmallIndex = tempTag.lastIndexOf('<')
        } while (tempSmallIndex != 0)

        //escape attributes in the tag
        tempTag = escapeAttr(tempTag)

        str = str.substring(greatIndex + 1)
        //check if the tag is script
        // if(tempTag.toLowerCase().indexOf("script")>=0)
        // tempTag = replaceChar(tempTag);

        //merge them up
        processed += replaceChar(tempStr) + tempTag
      } else {
        replaceChar(str)
        tagsExists = false
        break
      }
    } else {
      replaceChar(str)
      tagsExists = false
      break
    }
    //going to do next tag
    smallIndex = str.indexOf('<')
    greatIndex = 0
    do {
      //avoid other >
      greatIndex = str.indexOf('>', greatIndex + 1)
    } while (greatIndex < smallIndex && greatIndex != -1)
  }

  if (str != '') processed += replaceChar(str)

  return processed
}

window.unescapeHtml = unescapeHtml
window.escapeHTML = escapeHTML
