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

/* eslint-disable */
import { useStrict } from "mobx";
import ProjectStore from "../../stores/domain/ProjectStore";
import Suite from "../../models/Suite";
import TestCase from "../../models/TestCase";

useStrict(true);

describe("Suite model", () => {
  it("new suite should be named 'Utitled Suite'", () => {
    expect((new Suite()).name).toBe("Untitled Suite");
  });
  it("Suites should have randomly generated identifiers", () => {
    expect((new Suite()).id).not.toBe((new Suite()).id);
  });
  it("should rename the suite", () => {
    const suite = new Suite();
    suite.setName("test");
    expect(suite.name).toBe("test");
  });
  it("should add a new Test Case", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new TestCase();
    store.addTestCase(test);
    expect(suite.tests.length).toBe(0);
    suite.addTestCase(test);
    expect(suite.tests.length).toBe(1);
  });
  it("should throw if no Test Case was given", () => {
    const suite = new Suite();
    expect(() => suite.addTestCase()).toThrowError("Expected to receive TestCase instead received undefined");
  });
  it("should throw if a different type was given", () => {
    const suite = new Suite();
    expect(() => suite.addTestCase(1)).toThrowError("Expected to receive TestCase instead received Number");
  });
  it("should remove a Test Case from the suite", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new TestCase();
    store.addTestCase(test);
    suite.addTestCase(test);
    expect(suite.tests.length).toBe(1);
    suite.removeTestCase(test);
    expect(suite.tests.length).toBe(0);
  });
  it("should do nothing if removed a non-existent test", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    const test = new TestCase();
    store.addTestCase(test);
    suite.addTestCase(test);
    expect(suite.tests.length).toBe(1);
    suite.removeTestCase(new TestCase());
    expect(suite.tests.length).toBe(1);
  });
  it("should replace the tests in the suite", () => {
    const store = new ProjectStore();
    const suite = new Suite();
    store.createTestCase();
    store.createTestCase();
    store.createTestCase();
    expect(suite.tests.length).toBe(0);
    suite.replaceTestCases(store.tests);
    expect(suite.tests.length).toBe(3);
  });
  it("should load from JS", () => {
    const jsRep = {
      id: "1",
      name: "test suite",
      tests: []
    };
    const suite = Suite.fromJS(jsRep);
    expect(suite.id).toBe(jsRep.id);
    expect(suite.name).toBe(jsRep.name);
    expect(suite instanceof Suite).toBeTruthy();
  });
  it("should load tests from JS", () => {
    const store = new ProjectStore();
    store.addTestCase(new TestCase("1"));
    store.addTestCase(new TestCase("2"));
    store.addTestCase(new TestCase("3"));
    const jsRep = {
      id: "1",
      name: "test suite",
      tests: ["2", "3"]
    };
    const suite = Suite.fromJS(jsRep, store.tests);
    expect(suite.tests.length).toBe(2);
    expect(suite.tests[0]).toBeInstanceOf(TestCase);
  });
});
