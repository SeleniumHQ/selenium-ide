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

import { registerLocator, canResolveLocator, resolveLocator } from "../../plugin/locatorResolver";

describe("locator resolver", () => {
  it("should register a locator", () => {
    expect(registerLocator("test", new Function())).toBeUndefined();
  });
  it("should fail to register a locator with no key", () => {
    expect(() => registerLocator()).toThrowError("Expected to receive string instead received undefined");
  });
  it("should fail to register a locator with a key that is not string", () => {
    expect(() => registerLocator(5, new Function())).toThrowError("Expected to receive string instead received number");
  });
  it("should fail to register a locator with no callback", () => {
    expect(() => registerLocator("test")).toThrowError("Expected to receive function instead received undefined");
  });
  it("should fail to register a locator with a callback that is not a function", () => {
    expect(() => registerLocator("test", 1)).toThrowError("Expected to receive function instead received number");
  });
  it("should fail to register a locator with the same key as a previous one", () => {
    const key = "testTwo";
    registerLocator(key, new Function());
    expect(() => registerLocator(key, new Function())).toThrowError(`A locator named ${key} already exists`);
  });
  it("should check if a locator may be resolved", () => {
    registerLocator("exists", new Function());
    expect(canResolveLocator("exists")).toBeTruthy();
    expect(canResolveLocator("nonExistent")).toBeFalsy();
  });
  it("should throw when resolving a locator that does not exist", () => {
    const locator = "nonExistent";
    expect(() => resolveLocator(locator)).toThrowError(`The locator ${locator} is not registered with any plugin`);
  });
  it("should successfully resolve a sync locator", () => {
    const cb = () => {
      return "//button";
    };
    registerLocator("syncLocator", cb);
    expect(resolveLocator("syncLocator")).toBe("//button");
  });
  it("should fail to resolve a sync locator", () => {
    const locator = "syncFail";
    const cb = () => {
      throw new Error("test error");
    };
    registerLocator(locator, cb);
    expect(() => {
      try {
        resolveLocator(locator);
      } catch(e) {
        if (e.message !== `The locator ${locator} is not registered with any plugin`) {
          throw e;
        }
      }
    }).toThrow("test error");
  });
  it("should throw if the returned value is not an xpath", () => {
    const locator = "xpathErr";
    const cb = () => {
      return 5;
    };
    registerLocator(locator, cb);
    expect(() => {
      try {
        resolveLocator(locator);
      } catch(e) {
        if (e.message !== `The locator ${locator} is not registered with any plugin`) {
          throw e;
        }
      }
    }).toThrow(`Locator ${locator} returned an invalid response`);
  });
  it("should successfully resolve an async locator", () => {
    registerLocator("asyncLocator", () => Promise.resolve("//button"));
    expect(resolveLocator("asyncLocator")).resolves.toBe("//button");
  });
  it("should fail to resolve an async locator", () => {
    registerLocator("asyncFail", () => Promise.reject(false));
    expect(resolveLocator("asyncFail")).rejects.toBeFalsy();
  });
  it("should pass options to the locator resolver", () => {
    registerLocator("optionsLocator", (target, options) => (options.first));
    const option = "test";
    expect(resolveLocator("optionsLocator", "button", { first: option })).toEqual(option);
  });
});
