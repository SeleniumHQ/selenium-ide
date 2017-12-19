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

import CommandEmitter from "../../selianize/command";

describe("command code emitter", () => {
  it("should fail to emit with no command", () => {
    const command = {
      command: "",
      target: "",
      value: ""
    };
    expect(CommandEmitter.emit(command)).rejects.toThrow("Command can not be empty");
  });
  it("should fail to emit unknown command", () => {
    const command = {
      command: "doesntExist",
      target: "",
      value: ""
    };
    expect(CommandEmitter.emit(command)).rejects.toThrow(`Unknown command ${command.command}`);
  });
  it("should emit `open` command", () => {
    const command = {
      command: "open",
      target: "/",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.get(BASE_URL + "${command.target}");`);
  });
  it("should emit `click` command", () => {
    const command = {
      command: "click",
      target: "link=button",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(${command.target}).then(element => {driver.actions().click(element).perform();});`);
  });
  it("should emit `click at` command", () => {
    const command = {
      command: "clickAt",
      target: "link=button",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(${command.target}).then(element => {driver.actions().click(element).perform();});`);
  });
  it("should emit `type` command", () => {
    const command = {
      command: "type",
      target: "id=input",
      value: "example input"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(${command.target}).then(element => {driver.actions().click(element).sendKeys(${command.value}).perform();});`);
  });
  it("should emit `send keys` command", () => {
    const command = {
      command: "sendKeys",
      target: "id=input",
      value: "example input"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(${command.target}).then(element => {driver.actions().click(element).sendKeys(${command.value}).perform();});`);
  });
});
