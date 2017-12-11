/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MozillaBrowserBot } from "./selenium-browserbot";
import { core } from "./closure-polyfill";
const exactMatchPattern = window.global.exactMatchPattern;

export default function LocatorBuilders(window) {
  this.window = window;
}

window.LocatorBuilders = LocatorBuilders;

LocatorBuilders.prototype.detach = function() {
  if (this.window._locator_pageBot) {
    this.window._locator_pageBot = undefined;
    // Firefox 3 (beta 5) throws "Security Manager vetoed action" when we use delete operator like this:
    // delete this.window._locator_pageBot;
  }
};

LocatorBuilders.prototype.pageBot = function() {
  let pageBot = this.window._locator_pageBot;
  if (pageBot == null) {
    pageBot = new MozillaBrowserBot(this.window);
    let self = this;
    pageBot.getCurrentWindow = function() {
      return self.window;
    };
    this.window._locator_pageBot = pageBot;
  }
  return pageBot;
};

LocatorBuilders.prototype.buildWith = function(name, e, opt_contextNode) {
  return LocatorBuilders.builderMap[name].call(this, e, opt_contextNode);
};

LocatorBuilders.prototype.elementEquals = function(name, e, locator) {
  let fe = this.findElement(locator);
  //TODO: add match function to the ui locator builder, note the inverted parameters
  return (e == fe) || (LocatorBuilders.builderMap[name] && LocatorBuilders.builderMap[name].match && LocatorBuilders.builderMap[name].match(e, fe));
};

LocatorBuilders.prototype.build = function(e) {
  let locators = this.buildAll(e);
  if (locators.length > 0) {
    return locators[0][0];
  } else {
    return "LOCATOR_DETECTION_FAILED";
  }
};

LocatorBuilders.prototype.buildAll = function(el) {
  let e = core.firefox.unwrap(el); //Samit: Fix: Do the magic to get it to work in Firefox 4
  let locator;
  let locators = [];
  let coreLocatorStrategies = this.pageBot().locationStrategies;
  for (let i = 0; i < LocatorBuilders.order.length; i++) {
    let finderName = LocatorBuilders.order[i];
    try {
      locator = this.buildWith(finderName, e);
      if (locator) {
        locator = String(locator);
        //Samit: The following is a quickfix for above commented code to stop exceptions on almost every locator builder
        //TODO: the builderName should NOT be used as a strategy name, create a feature to allow locatorBuilders to specify this kind of behaviour
        //TODO: Useful if a builder wants to capture a different element like a parent. Use the this.elementEquals
        let fe = this.findElement(locator);
        if ((e == fe) || (coreLocatorStrategies[finderName] && coreLocatorStrategies[finderName].is_fuzzy_match && coreLocatorStrategies[finderName].is_fuzzy_match(fe, e))) {
          locators.push([locator, finderName]);
        }
      }
    } catch (e) {
      // TODO ignore the buggy locator builder for now
      //this.log.debug("locator exception: " + e);
    }
  }
  return locators;
};

LocatorBuilders.prototype.findElement = function(locator) {
  try {
    return this.pageBot().findElement(locator);
  } catch (error) {
    //this.log.debug("findElement failed: " + error + ", locator=" + locator);
    return null;
  }
};

/*
 * Class methods
 */

LocatorBuilders.order = [];
LocatorBuilders.builderMap = {};
LocatorBuilders._preferredOrder = [];
// NOTE: for some reasons we does not use this part
// classObservable(LocatorBuilders);

LocatorBuilders.add = function(name, finder) {
  this.order.push(name);
  this.builderMap[name] = finder;
  this._orderChanged();
};

/**
 * Call when the order or preferred order changes
 */
LocatorBuilders._orderChanged = function() {
  let changed = this._ensureAllPresent(this.order, this._preferredOrder);
  this._sortByRefOrder(this.order, this._preferredOrder);
  if (changed) {
    // NOTE: for some reasons we does not use this part 
    // this.notify('preferredOrderChanged', this._preferredOrder);
  }
};

/**
 * Set the preferred order of the locator builders
 *
 * @param preferredOrder can be an array or a comma separated string of names
 */
LocatorBuilders.setPreferredOrder = function(preferredOrder) {
  if (typeof preferredOrder === "string") {
    this._preferredOrder = preferredOrder.split(",");
  } else {
    this._preferredOrder = preferredOrder;
  }
  this._orderChanged();
};

/**
 * Returns the locator builders preferred order as an array
 */
LocatorBuilders.getPreferredOrder = function() {
  return this._preferredOrder;
};

/**
 * Sorts arrayToSort in the order of elements in sortOrderReference
 * @param arrayToSort
 * @param sortOrderReference
 */
LocatorBuilders._sortByRefOrder = function(arrayToSort, sortOrderReference) {
  let raLen = sortOrderReference.length;
  arrayToSort.sort(function(a, b) {
    let ai = sortOrderReference.indexOf(a);
    let bi = sortOrderReference.indexOf(b);
    return (ai > -1 ? ai : raLen) - (bi > -1 ? bi : raLen);
  });
};

/**
 * Function to add to the bottom of destArray elements from source array that do not exist in destArray
 * @param sourceArray
 * @param destArray
 */
LocatorBuilders._ensureAllPresent = function(sourceArray, destArray) {
  let changed = false;
  sourceArray.forEach(function(e) {
    if (destArray.indexOf(e) == -1) {
      destArray.push(e);
      changed = true;
    }
  });
  return changed;
};

/*
 * Utility function: Encode XPath attribute value.
 */
LocatorBuilders.prototype.attributeValue = function(value) {
  if (value.indexOf("'") < 0) {
    return "'" + value + "'";
  } else if (value.indexOf("\"") < 0) {
    return "\"" + value + "\"";
  } else {
    let result = "concat(";
    let part = "";
    let didReachEndOfValue = false;
    while (!didReachEndOfValue) {
      let apos = value.indexOf("'");
      let quot = value.indexOf("\"");
      if (apos < 0) {
        result += "'" + value + "'";
        didReachEndOfValue = true;
        break;
      } else if (quot < 0) {
        result += "\"" + value + "\"";
        didReachEndOfValue = true;
        break;
      } else if (quot < apos) {
        part = value.substring(0, apos);
        result += "'" + part + "'";
        value = value.substring(part.length);
      } else {
        part = value.substring(0, quot);
        result += "\"" + part + "\"";
        value = value.substring(part.length);
      }
      result += ",";
    }
    result += ")";
    return result;
  }
};

LocatorBuilders.prototype.xpathHtmlElement = function(name) {
  if (this.window.document.contentType == "application/xhtml+xml") {
    // "x:" prefix is required when testing XHTML pages
    return "x:" + name;
  } else {
    return name;
  }
};

LocatorBuilders.prototype.relativeXPathFromParent = function(current) {
  let index = this.getNodeNbr(current);
  let currentPath = "/" + this.xpathHtmlElement(current.nodeName.toLowerCase());
  if (index > 0) {
    currentPath += "[" + (index + 1) + "]";
  }
  return currentPath;
};

LocatorBuilders.prototype.getNodeNbr = function(current) {
  let childNodes = current.parentNode.childNodes;
  let total = 0;
  let index = -1;
  for (let i = 0; i < childNodes.length; i++) {
    let child = childNodes[i];
    if (child.nodeName == current.nodeName) {
      if (child == current) {
        index = total;
      }
      total++;
    }
  }
  return index;
};

LocatorBuilders.prototype.getCSSSubPath = function(e) {
  let css_attributes = ["id", "name", "class", "type", "alt", "title", "value"];
  for (let i = 0; i < css_attributes.length; i++) {
    let attr = css_attributes[i];
    let value = e.getAttribute(attr);
    if (value) {
      if (attr == "id")
        return "#" + value;
      if (attr == "class")
        return e.nodeName.toLowerCase() + "." + value.replace(" ", ".").replace("..", ".");
      return e.nodeName.toLowerCase() + "[" + attr + "=\"" + value + "\"]";
    }
  }
  if (this.getNodeNbr(e))
    return e.nodeName.toLowerCase() + ":nth-of-type(" + this.getNodeNbr(e) + ")";
  else
    return e.nodeName.toLowerCase();
};

LocatorBuilders.prototype.preciseXPath = function(xpath, e) {
  //only create more precise xpath if needed
  if (this.findElement(xpath) != e) {
    let result = e.ownerDocument.evaluate(xpath, e.ownerDocument, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    //skip first element (result:0 xpath index:1)
    for (let i = 0, len = result.snapshotLength; i < len; i++) {
      let newPath = "xpath=(" + xpath + ")[" + (i + 1) + "]";
      if (this.findElement(newPath) == e) {
        return newPath;
      }
    }
  }
  return xpath;
};

/*
 * ===== builders =====
 */

LocatorBuilders.add("ui", function(pageElement) {
  return UIMap.getInstance().getUISpecifierString(pageElement,
    this.window.document);
});

LocatorBuilders.add("id", function(e) {
  if (e.id) {
    return "id=" + e.id;
  }
  return null;
});

LocatorBuilders.add("link", function(e) {
  if (e.nodeName == "A") {
    let text = e.textContent;
    if (!text.match(/^\s*$/)) {
      return "link=" + exactMatchPattern(text.replace(/\xA0/g, " ").replace(/^\s*(.*?)\s*$/, "$1"));
    }
  }
  return null;
});

LocatorBuilders.add("name", function(e) {
  if (e.name) {
    return "name=" + e.name;
  }
  return null;
});

LocatorBuilders.add("css", function(e) {
  let current = e;
  let sub_path = this.getCSSSubPath(e);
  while (this.findElement("css=" + sub_path) != e && current.nodeName.toLowerCase() != "html") {
    sub_path = this.getCSSSubPath(current.parentNode) + " > " + sub_path;
    current = current.parentNode;
  }
  return "css=" + sub_path;
});

/*
 * This function is called from DOM locatorBuilders
 */
LocatorBuilders.prototype.findDomFormLocator = function(form) {
  if (form.hasAttribute("name")) {
    let name = form.getAttribute("name");
    let locator = "document." + name;
    if (this.findElement(locator) == form) {
      return locator;
    }
    locator = "document.forms['" + name + "']";
    if (this.findElement(locator) == form) {
      return locator;
    }
  }
  let forms = this.window.document.forms;
  for (let i = 0; i < forms.length; i++) {
    if (form == forms[i]) {
      return "document.forms[" + i + "]";
    }
  }
  return null;
};

LocatorBuilders.add("dom:name", function(e) {
  if (e.form && e.name) {
    let formLocator = this.findDomFormLocator(e.form);
    if (formLocator) {
      let candidates = [formLocator + "." + e.name,
        formLocator + ".elements['" + e.name + "']"
      ];
      for (let c = 0; c < candidates.length; c++) {
        let locator = candidates[c];
        let found = this.findElement(locator);
        if (found) {
          if (found == e) {
            return locator;
          } else if (found instanceof NodeList) {
            // multiple elements with same name
            for (let i = 0; i < found.length; i++) {
              if (found[i] == e) {
                return locator + "[" + i + "]";
              }
            }
          }
        }
      }
    }
  }
  return null;
});

LocatorBuilders.add("xpath:link", function(e) {
  if (e.nodeName == "A") {
    let text = e.textContent;
    if (!text.match(/^\s*$/)) {
      return this.preciseXPath("//" + this.xpathHtmlElement("a") + "[contains(text(),'" + text.replace(/^\s+/, "").replace(/\s+$/, "") + "')]", e);
    }
  }
  return null;
});

LocatorBuilders.add("xpath:img", function(e) {
  if (e.nodeName == "IMG") {
    if (e.alt != "") {
      return this.preciseXPath("//" + this.xpathHtmlElement("img") + "[@alt=" + this.attributeValue(e.alt) + "]", e);
    } else if (e.title != "") {
      return this.preciseXPath("//" + this.xpathHtmlElement("img") + "[@title=" + this.attributeValue(e.title) + "]", e);
    } else if (e.src != "") {
      return this.preciseXPath("//" + this.xpathHtmlElement("img") + "[contains(@src," + this.attributeValue(e.src) + ")]", e);
    }
  }
  return null;
});

LocatorBuilders.add("xpath:attributes", function(e) {
  const PREFERRED_ATTRIBUTES = ["id", "name", "value", "type", "action", "onclick"];
  let i = 0;

  function attributesXPath(name, attNames, attributes) {
    let locator = "//" + this.xpathHtmlElement(name) + "[";
    for (i = 0; i < attNames.length; i++) {
      if (i > 0) {
        locator += " and ";
      }
      let attName = attNames[i];
      locator += "@" + attName + "=" + this.attributeValue(attributes[attName]);
    }
    locator += "]";
    return this.preciseXPath(locator, e);
  }

  if (e.attributes) {
    let atts = e.attributes;
    let attsMap = {};
    for (i = 0; i < atts.length; i++) {
      let att = atts[i];
      attsMap[att.name] = att.value;
    }
    let names = [];
    // try preferred attributes
    for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
      let name = PREFERRED_ATTRIBUTES[i];
      if (attsMap[name] != null) {
        names.push(name);
        let locator = attributesXPath.call(this, e.nodeName.toLowerCase(), names, attsMap);
        if (e == this.findElement(locator)) {
          return locator;
        }
      }
    }
  }
  return null;
});

LocatorBuilders.add("xpath:idRelative", function(e) {
  let path = "";
  let current = e;
  while (current != null) {
    if (current.parentNode != null) {
      path = this.relativeXPathFromParent(current) + path;
      if (1 == current.parentNode.nodeType && // ELEMENT_NODE
        current.parentNode.getAttribute("id")) {
        return this.preciseXPath("//" + this.xpathHtmlElement(current.parentNode.nodeName.toLowerCase()) +
          "[@id=" + this.attributeValue(current.parentNode.getAttribute("id")) + "]" +
          path, e);
      }
    } else {
      return null;
    }
    current = current.parentNode;
  }
  return null;
});

LocatorBuilders.add("xpath:href", function(e) {
  if (e.attributes && e.hasAttribute("href")) {
    let href = e.getAttribute("href");
    if (href.search(/^http?:\/\//) >= 0) {
      return this.preciseXPath("//" + this.xpathHtmlElement("a") + "[@href=" + this.attributeValue(href) + "]", e);
    } else {
      // use contains(), because in IE getAttribute("href") will return absolute path
      return this.preciseXPath("//" + this.xpathHtmlElement("a") + "[contains(@href, " + this.attributeValue(href) + ")]", e);
    }
  }
  return null;
});

LocatorBuilders.add("dom:index", function(e) {
  if (e.form) {
    let formLocator = this.findDomFormLocator(e.form);
    if (formLocator) {
      let elements = e.form.elements;
      for (let i = 0; i < elements.length; i++) {
        if (elements[i] == e) {
          return formLocator + ".elements[" + i + "]";
        }
      }
    }
  }
  return null;
});

LocatorBuilders.add("xpath:position", function(e, opt_contextNode) {
  //this.log.debug("positionXPath: e=" + e);
  let path = "";
  let current = e;
  while (current != null && current != opt_contextNode) {
    let currentPath;
    if (current.parentNode != null) {
      currentPath = this.relativeXPathFromParent(current);
    } else {
      currentPath = "/" + this.xpathHtmlElement(current.nodeName.toLowerCase());
    }
    path = currentPath + path;
    let locator = "/" + path;
    if (e == this.findElement(locator)) {
      return locator;
    }
    current = current.parentNode;
    //this.log.debug("positionXPath: current=" + current);
  }
  return null;
});
// Samit: Warning: The old method of setting the order using LocatorBuilders.order is now deprecated
// You can change the priority of builders by setting LocatorBuilders.order.
//LocatorBuilders.order = ['ui', 'id', 'link', 'name', 'css', 'dom:name', 'xpath:link', 'xpath:img', 'xpath:attributes', 'xpath:idRelative', 'xpath:href', 'dom:index', 'xpath:position'];
