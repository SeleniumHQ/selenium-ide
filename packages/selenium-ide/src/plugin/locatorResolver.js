// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

const locators = {};

function verifyXpath(locator, response) {
  if (typeof response !== "string") {
    throw new Error(`Locator ${locator} returned an invalid response`);
  }
  return response;
}

function isDefaultLocator(locator) {
  return (locator === "id" ||
    locator === "name" ||
    locator === "link" ||
    locator === "css" ||
    locator === "xpath");
}

export function registerLocator(locator, func) {
  if (typeof locator !== "string") {
    throw new Error(`Expected to receive string instead received ${typeof locator}`);
  } else if (isDefaultLocator(locator)) {
    throw new Error("Overriding default locator strategies is disallowed");
  } else if (typeof func !== "function") {
    throw new Error(`Expected to receive function instead received ${typeof func}`);
  } else if (locators[locator]) {
    throw new Error(`A locator named ${locator} already exists`);
  } else {
    locators[locator] = func;
  }
}

export function canResolveLocator(locator) {
  return locators.hasOwnProperty(locator);
}

export function resolveLocator(locator, target, options) {
  if (!locators[locator]) {
    throw new Error(`The locator ${locator} is not registered with any plugin`);
  } else {
    const response = locators[locator](target, options);

    if (response instanceof Promise) {
      return response.then((r) => (verifyXpath(locator, r)));
    }
    return verifyXpath(locator, response);
  }
}
