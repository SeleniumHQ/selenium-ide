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
    expect(CommandEmitter.emit(command)).resolves.toBe("driver.findElement(By.linkText(\"button\")).then(element => {driver.actions().click(element).perform();});");
  });
  it("should emit `click at` command", () => {
    const command = {
      command: "clickAt",
      target: "link=button",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe("driver.findElement(By.linkText(\"button\")).then(element => {driver.actions().click(element).perform();});");
  });
  it("should emit `double click` command", () => {
    const command = {
      command: "doubleClick",
      target: "link=button",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe("driver.findElement(By.linkText(\"button\")).then(element => {driver.actions().doubleClick(element).perform();});");
  });
  it("should emit `double click at` command", () => {
    const command = {
      command: "doubleClickAt",
      target: "link=button",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe("driver.findElement(By.linkText(\"button\")).then(element => {driver.actions().doubleClick(element).perform();});");
  });
  it("should emit `drag and drop to object` command", () => {
    const command = {
      command: "dragAndDropToObject",
      target: "link=dragged",
      value: "link=dropzone"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe("driver.findElement(By.linkText(\"dragged\")).then(dragged => {driver.findElement(By.linkText(\"dropzone\")).then(dropzone => {driver.actions().dragAndDrop(dragged, dropzone).perform();});});");
  });
  it("should emit `type` command", () => {
    const command = {
      command: "type",
      target: "id=input",
      value: "example input"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(By.id("input")).then(element => {driver.actions().click(element).sendKeys("${command.value}").perform();});`);
  });
  it("should emit `send keys` command", () => {
    const command = {
      command: "sendKeys",
      target: "id=input",
      value: "example input"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(By.id("input")).then(element => {driver.actions().click(element).sendKeys("${command.value}").perform();});`);
  });
  it("should emit `echo` command", () => {
    const command = {
      command: "echo",
      target: "test message",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`console.log("${command.target}");`);
  });
  it("should emit `run script` command", () => {
    const command = {
      command: "runScript",
      target: "alert('test');\nalert('Im annoying');",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.executeScript(\`${command.target}\`);`);
  });
  it("should emit `pause` command", () => {
    const command = {
      command: "pause",
      target: "",
      value: "300"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.sleep(${command.value});`);
  });
  it("should emit `verify title` command", () => {
    const command = {
      command: "verifyTitle",
      target: "example title",
      value: ""
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.getTitle().then(title => {expect(title).toBe("${command.target}");});`);
  });
  it("should emit `verify text` command", () => {
    const command = {
      command: "verifyText",
      target: "id=test",
      value: "some text that should be here"
    };
    expect(CommandEmitter.emit(command)).resolves.toBe(`driver.findElement(By.id("test")).then(element => {element.getText().then(text => {expect(text).toBe("${command.value}")});});`);
  });
});
