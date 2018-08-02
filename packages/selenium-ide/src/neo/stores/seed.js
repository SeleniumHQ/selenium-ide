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

  const url = "http://the-internet.herokuapp.com";
  store.setUrl(url);
  store.addUrl(url);

  const checkTest = store.createTestCase("check");
  checkTest.createCommand(undefined, "open", "/checkboxes");
  checkTest.createCommand(undefined, "check", "css=input");
  checkTest.createCommand(undefined, "assertChecked", "css=input");
  checkTest.createCommand(undefined, "uncheck", "css=input");
  checkTest.createCommand(undefined, "assertNotChecked", "css=input");

  const clickTest = store.createTestCase("click");
  //clickTest.setComment("Open the wikipedia Legislation article");
  clickTest.createCommand(undefined, "open", "/");
  clickTest.createCommand(undefined, "click", "css=a");

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
  sendKeysTest.createCommand(undefined, "assertText", "css=#username", "blah");

  const storeTextTest = store.createTestCase("store text");
  storeTextTest.createCommand(undefined, "open", "/login");
  storeTextTest.createCommand(undefined, "sendKeys", "css=#username", "blah");
  storeTextTest.createCommand(undefined, "storeText", "css=#username", "aVar");
  storeTextTest.createCommand(undefined, "echo", "${aVar}");

  const submitTest = store.createTestCase("submit");
  submitTest.createCommand(undefined, "open", "/login");
  submitTest.createCommand(undefined, "sendKeys", "css=#username", "tomsmith");
  submitTest.createCommand(undefined, "sendKeys", "css=#password", "SuperSecretPassword!");
  submitTest.createCommand(undefined, "submit", "css=#login");
  submitTest.createCommand(undefined, "assertElementPresent", "css=.flash.success");

  const smokeSuite = store.createSuite("smoke");

  store.tests.forEach(function(test) {
    smokeSuite.addTestCase(test);
  });

  UiState.changeView("Test suites");
  let suiteState = UiState.getSuiteState(smokeSuite);
  suiteState.setOpen(true);
  UiState.selectTest(checkTest, smokeSuite);

  store.changeName("seed project");

  return store;
}
