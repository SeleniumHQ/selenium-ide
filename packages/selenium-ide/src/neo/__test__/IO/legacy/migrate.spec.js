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

import fs from "fs";
import path from "path";
import { useStrict } from "mobx";
import { migrateTestCase, migrateProject } from "../../../IO/legacy/migrate";

useStrict(true);

describe("selenium test case migration", () => {
  it("should migrate the set example", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test.html")).toString();
    const project = migrateTestCase(file);
    expect(project.name).toBe("My Test");
    expect(project.url).toBe("https://www.google.com/");
    expect(project.urls.length).toBe(1);
    expect(project.suites).toBeInstanceOf(Array);
    expect(project.tests.length).toBe(1);
    const test = project.tests[0];
    expect(test.commands.length).toBe(4);
    const command = test.commands[0];
    expect(command.command).toBe("open");
    expect(command.target).toBe("/?gfe_rd=cr&dcr=0&ei=9vz6Way_KdPPXqjmsbgI&gws_rd=ssl");
    expect(command.value).toBe("");
  });
  it("should migrate the second example", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_2.html")).toString();
    const project = migrateTestCase(file);
    expect(project.tests[0].commands.length).toBe(26);
  });
  it("should join line breaks to <br /> in the target field", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_2.html")).toString();
    const project = migrateTestCase(file);
    expect(project.tests[0].commands[8].target).toBe("//a[contains(text(),'Most<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;followers')]");
  });
  it("should sanitize the input prior to converting", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_3.html")).toString();
    const project = migrateTestCase(file);
    expect(project.tests[0].name).toBe("Show Details");
    expect(project.tests[0].commands[0].target).toBe("http://unknow.url/?func=ll&objid=2838227");
  });
  it("should decode the input post conversion", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_8.html")).toString();
    const project = migrateTestCase(file);
    expect(project.tests[0].commands[14].target).toBe("//a[@onclick='return confirm(\"Wollen Sie den Datensatz wirklich löschen?\")']");
  });
});

describe("selenium suite migration", () => {
  it("should migrate the suite", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_4.zip"));
    return migrateProject(file).then(project => {
      expect(project.suites.length).toBe(1);
    });
  });
  it("should fail to migrate due to missing test case", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_5.zip"));
    return migrateProject(file).catch(error => {
      expect(error.message).toBe("The file einzeltests/MH_delete.html is missing, suite can't be migrated");
    });
  });
  it("should migrate multiple suites", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_6.zip"));
    return migrateProject(file).then(project => {
      expect(project.suites.length).toBe(2);
      expect(project.tests.length).toBe(3);
    });
  });
  it("should create a suite if none was given", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_7.zip"));
    return migrateProject(file).then(project => {
      expect(project.suites.length).toBe(1);
      expect(project.tests.length).toBe(3);
    });
  });
});
