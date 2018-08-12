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

import generate from "project-name-generator";
import { CommandsArray } from "../models/Command";
import UiState from "./view/UiState";

export default function seed(store, numberOfSuites = 5) {
  function generateSuite() {
    return store.createSuite(generate({ words: 2 }).spaced);
  }
  function generateTestCase() {
    return store.createTestCase(generate({ words: 2 }).spaced);
  }
  const targets = ["a", "button"];
  function generateCommand(test) {
    const command = test.createCommand();
    command.setCommand(CommandsArray[Math.floor(Math.random() * CommandsArray.length)]);
    let targetChance = Math.floor(Math.random() * 10);
    command.setTarget(targetChance < targets.length ? targets[targetChance] : "");
    command.setValue(Math.floor(Math.random() * 2) ? generate({ words: 1 }).spaced : "");
    return command;
  }
  function randomBetween(min, max) {
    return (Math.floor(Math.random() * (max - min)) + min);
  }
  for (let i = 0; i < numberOfSuites; i++) {
    let suite = generateSuite();
    for (let j = 0; j < randomBetween(3, 6); j++) {
      const testCase = generateTestCase();
      for (let k = 0; k < randomBetween(9, 16); k++) {
        generateCommand(testCase);
      }
      suite.addTestCase(testCase);
    }
  }

  const url = "http://the-internet.local";
  store.setUrl(url);
  store.addUrl(url);

  const controlFlowIfTest = store.createTestCase("control flow if");
  controlFlowIfTest.createCommand(undefined, "if", "true");
  controlFlowIfTest.createCommand(undefined, "echo", "foo");
  controlFlowIfTest.createCommand(undefined, "elseIf", "true");
  controlFlowIfTest.createCommand(undefined, "echo", "bar");
  controlFlowIfTest.createCommand(undefined, "else");
  controlFlowIfTest.createCommand(undefined, "echo", "baz");
  controlFlowIfTest.createCommand(undefined, "end");

  const controlFlowElseIfTest = store.createTestCase("control flow else if");
  controlFlowElseIfTest.createCommand(undefined, "if", "false");
  controlFlowElseIfTest.createCommand(undefined, "echo", "foo");
  controlFlowElseIfTest.createCommand(undefined, "elseIf", "true");
  controlFlowElseIfTest.createCommand(undefined, "echo", "bar");
  controlFlowElseIfTest.createCommand(undefined, "else");
  controlFlowElseIfTest.createCommand(undefined, "echo", "baz");
  controlFlowElseIfTest.createCommand(undefined, "end");

  const controlFlowElseTest = store.createTestCase("control flow else");
  controlFlowElseTest.createCommand(undefined, "if", "false");
  controlFlowElseTest.createCommand(undefined, "echo", "foo");
  controlFlowElseTest.createCommand(undefined, "elseIf", "false");
  controlFlowElseTest.createCommand(undefined, "echo", "bar");
  controlFlowElseTest.createCommand(undefined, "else");
  controlFlowElseTest.createCommand(undefined, "echo", "baz");
  controlFlowElseTest.createCommand(undefined, "end");

  const controlFlowDoTest = store.createTestCase("control flow do");
  controlFlowDoTest.createCommand(undefined, "do");
  controlFlowDoTest.createCommand(undefined, "echo", "foo");
  controlFlowDoTest.createCommand(undefined, "repeatIf", "true", "2");

  const controlFlowTimesTest = store.createTestCase("control flow times");
  controlFlowTimesTest.createCommand(undefined, "times", "2");
  controlFlowTimesTest.createCommand(undefined, "echo", "foo");
  controlFlowTimesTest.createCommand(undefined, "end");

  const controlFlowWhileTest = store.createTestCase("control flow while");
  controlFlowWhileTest.createCommand(undefined, "while", "true", "2");
  controlFlowWhileTest.createCommand(undefined, "echo", "foo");
  controlFlowWhileTest.createCommand(undefined, "end");

  const executeScriptSandboxTest = store.createTestCase("execute script");
  executeScriptSandboxTest.createCommand(undefined, "executeScript", "return true", "blah");
  executeScriptSandboxTest.createCommand(undefined, "echo", "${blah}");
  executeScriptSandboxTest.createCommand(undefined, "verify", "${blah}", "false");
  executeScriptSandboxTest.createCommand(undefined, "assert", "${blah}", "true");
  executeScriptSandboxTest.createCommand(undefined, "executeScript", "true");
  executeScriptSandboxTest.createCommand(undefined, "echo", "${blah}");

  const checkTest = store.createTestCase("check");
  checkTest.createCommand(undefined, "open", "/checkboxes");
  const command = checkTest.createCommand(undefined, "check", "css=input");
  command.setTargets([
    ["id=something", "id"],
    ["name=something-else", "name"],
    ["linkText=number density", "linkText"],
    ["css=main .class > p a.link", "css"],
    ["xpath=(//a[contains(text(),'number line')])[2]", "xpath:link"],
    ["(//a[contains(text(),'number line')])[2]", "xpath:link"],
    ["//a[contains(text(),'number density')]", "xpath:link"],
    ["//div[@id='mw-content-text']/div/p[2]/a[5]", "xpath:idRelative"],
    ["//a[contains(@href, '/wiki/Number_density')]", "xpath:href"],
    ["//a[5]", "xpath:position"]
  ]);
  checkTest.createCommand(undefined, "assertChecked", "css=input");
  checkTest.createCommand(undefined, "uncheck", "css=input");
  checkTest.createCommand(undefined, "assertNotChecked", "css=input");

  const clickTest = store.createTestCase("click");
  clickTest.createCommand(undefined, "open", "/");
  clickTest.createCommand(undefined, "click", "linkText=Dropdown");
  clickTest.createCommand(undefined, "assertText", "css=h3", "Dropdown List");
  clickTest.createCommand(undefined, "open", "/");
  clickTest.createCommand(undefined, "click", "link=Dropdown");
  clickTest.createCommand(undefined, "assertText", "css=h3", "Dropdown List");
  clickTest.createCommand(undefined, "open", "/");
  clickTest.createCommand(undefined, "click", "partialLinkText=ropd");
  clickTest.createCommand(undefined, "assertText", "css=h3", "Dropdown List");

  const clickAtTest = store.createTestCase("click at");
  clickAtTest.createCommand(undefined, "open", "/");
  clickAtTest.createCommand(undefined, "clickAt", "css=a");

  const framesTest = store.createTestCase("frames");
  framesTest.createCommand(undefined, "open", "/iframe");
  framesTest.createCommand(undefined, "selectFrame", "css=#mce_0_ifr");
  framesTest.createCommand(undefined, "assertText", "css=#tinymce", "Your content goes here.");
  framesTest.createCommand(undefined, "open", "/nested_frames");
  framesTest.createCommand(undefined, "selectFrame", "frame-top");
  framesTest.createCommand(undefined, "selectFrame", "frame-middle");
  framesTest.createCommand(undefined, "assertText", "css=#content", "MIDDLE");

  const selectTest = store.createTestCase("select");
  selectTest.createCommand(undefined, "open", "/dropdown");
  selectTest.createCommand(undefined, "select", "id=dropdown", "value=1");
  selectTest.createCommand(undefined, "assertSelectedValue", "id=dropdown", "1");
  selectTest.createCommand(undefined, "assertNotSelectedValue", "id=dropdown", "2");
  selectTest.createCommand(undefined, "assertSelectedLabel", "id=dropdown", "Option 1");
  selectTest.createCommand(undefined, "select", "id=dropdown", "Option 2");
  selectTest.createCommand(undefined, "assertSelectedValue", "id=dropdown", "2");
  selectTest.createCommand(undefined, "assertNotSelectedValue", "id=dropdown", "1");
  selectTest.createCommand(undefined, "assertSelectedLabel", "id=dropdown", "Option 2");

  const sendKeysTest = store.createTestCase("send keys");
  sendKeysTest.createCommand(undefined, "open", "/login");
  sendKeysTest.createCommand(undefined, "sendKeys", "css=#username", "blah");
  sendKeysTest.createCommand(undefined, "assertValue", "css=#username", "blah");

  const storeTextTest = store.createTestCase("store text");
  storeTextTest.createCommand(undefined, "open", "/login");
  storeTextTest.createCommand(undefined, "sendKeys", "css=#username", "blah");
  storeTextTest.createCommand(undefined, "storeValue", "css=#username", "aVar");
  storeTextTest.createCommand(undefined, "echo", "${aVar}");

  const submitTest = store.createTestCase("submit");
  submitTest.createCommand(undefined, "open", "/login");
  submitTest.createCommand(undefined, "sendKeys", "css=#username", "tomsmith");
  submitTest.createCommand(undefined, "sendKeys", "css=#password", "SuperSecretPassword!");
  submitTest.createCommand(undefined, "submit", "css=#login");
  submitTest.createCommand(undefined, "assertElementPresent", "css=.flash.success");

  const suiteControlFlow = store.createSuite("control flow");
  suiteControlFlow.addTestCase(controlFlowIfTest);
  suiteControlFlow.addTestCase(controlFlowElseIfTest);
  suiteControlFlow.addTestCase(controlFlowElseTest);
  suiteControlFlow.addTestCase(controlFlowDoTest);
  suiteControlFlow.addTestCase(controlFlowTimesTest);
  suiteControlFlow.addTestCase(controlFlowWhileTest);

  const suiteAll = store.createSuite("all tests");
  store.tests.forEach(function(test) {
    suiteAll.addTestCase(test);
  });

  const smokeSuite = store.createSuite("smoke");
  smokeSuite.addTestCase(checkTest);
  smokeSuite.addTestCase(clickTest);
  smokeSuite.addTestCase(clickAtTest);
  smokeSuite.addTestCase(executeScriptSandboxTest);
  smokeSuite.addTestCase(framesTest);
  smokeSuite.addTestCase(selectTest);
  smokeSuite.addTestCase(sendKeysTest);
  smokeSuite.addTestCase(storeTextTest);
  smokeSuite.addTestCase(submitTest);

  UiState.changeView("Test suites");
  let suiteState = UiState.getSuiteState(suiteControlFlow);
  suiteState.setOpen(true);
  UiState.selectTest(controlFlowIfTest, suiteControlFlow);

  store.changeName("seed project");

  return store;
}
