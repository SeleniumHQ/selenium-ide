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
import fs from "fs";
import path from "path";
import { useStrict } from "mobx";
import migrateProject from "../../../IO/legacy/migrate";

useStrict(true);

describe("selenium html migrate", () => {
  it("should migrate the set example", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test.html"));
    const project = migrateProject(file);
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
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_2.html"));
    const project = migrateProject(file);
    expect(project.tests[0].commands.length).toBe(26);
  });
  it("should join line breaks to <br /> in the target field", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_2.html"));
    const project = migrateProject(file);
    expect(project.tests[0].commands[8].target).toBe("//a[contains(text(),'Most<br />                                followers')]");
  });
});
