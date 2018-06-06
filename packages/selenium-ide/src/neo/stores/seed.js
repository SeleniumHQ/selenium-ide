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
    return store.createSuite(generate({ words: 2}).spaced);
  }
  function generateTestCase() {
    return store.createTestCase(generate({ words: 2}).spaced);
  }
  const targets = ["a", "button"];
  function generateCommand(test) {
    const command = test.createCommand();
    command.setCommand(CommandsArray[Math.floor(Math.random() * CommandsArray.length)]);
    let targetChance = Math.floor(Math.random() * 10);
    command.setTarget(targetChance < targets.length ? targets[targetChance] : "");
    command.setValue(Math.floor(Math.random() * 2) ? generate({ words: 1}).spaced : "");
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

  const url = "https://en.wikipedia.org";
  store.setUrl(url);
  store.addUrl(url);
  const playbackTest = store.createTestCase("aa playback");
  const open = playbackTest.createCommand();
  open.setComment("Open the wikipedia Legislation article");
  open.setCommand("open");
  open.setTarget("/wiki/Legislation");
  const firstClick = playbackTest.createCommand();
  firstClick.setCommand("click");
  firstClick.setTarget("link=enacted");
  const storeCommand = playbackTest.createCommand();
  storeCommand.setCommand("store");
  storeCommand.setTarget("value 1");
  storeCommand.setValue("variable1");
  const ifCommand = playbackTest.createCommand();
  ifCommand.setCommand("if");
  ifCommand.setTarget("variable1 === 'value1'");
  const assertText = playbackTest.createCommand();
  assertText.setCommand("assertText");
  assertText.setTarget("id=Approval");
  assertText.setValue("Approval");
  const elseIfCommand = playbackTest.createCommand();
  elseIfCommand.setCommand("elseIf");
  elseIfCommand.setTarget("1 === 1");
  const verifyEditableCommand = playbackTest.createCommand();
  verifyEditableCommand.setCommand("verifyEditable");
  verifyEditableCommand.setTarget("id=searchInput");
  const endCommand = playbackTest.createCommand();
  endCommand.setCommand("end");
  endCommand.setTarget("");
  const echo = playbackTest.createCommand();
  echo.setCommand("echo");
  echo.setTarget("Finished!");

  const playbackTest2 = store.createTestCase("aab playback");
  const open2 = playbackTest2.createCommand();
  open2.setCommand("open");
  open2.setTarget("/wiki/River_Chater");
  const whileCommand = playbackTest2.createCommand();
  whileCommand.setCommand("while");
  whileCommand.setTarget("1 === 1");
  const echoCommand = playbackTest2.createCommand();
  echoCommand.setCommand("echo");
  echoCommand.setTarget("iteration");
  const doCommand = playbackTest2.createCommand();
  doCommand.setCommand("do");
  doCommand.setTarget("");
  const ifCommandd = playbackTest2.createCommand();
  ifCommandd.setCommand("if");
  ifCommandd.setTarget("1 === 1");
  const continueCommand = playbackTest2.createCommand();
  continueCommand.setCommand("continue");
  continueCommand.setTarget("");
  const endCommandd = playbackTest2.createCommand();
  endCommandd.setCommand("end");
  endCommandd.setTarget("");
  const repeatIfCommand = playbackTest2.createCommand();
  repeatIfCommand.setCommand("repeatIf");
  repeatIfCommand.setTarget("1 === 2");
  const endCommandd2 = playbackTest2.createCommand();
  endCommandd2.setCommand("end");
  endCommandd2.setTarget("");

  const typeTest = store.createTestCase("aab type");
  const open3 = typeTest.createCommand();
  open3.setCommand("open");
  open3.setTarget("/wiki/Main_Page");
  const clickSearch = typeTest.createCommand();
  clickSearch.setCommand("clickAt");
  clickSearch.setTarget("id=searchInput");
  const type = typeTest.createCommand();
  type.setCommand("type");
  type.setTarget("id=searchInput");
  type.setValue("Selenium IDE");

  const submit = typeTest.createCommand();
  submit.setCommand("clickAt");
  submit.setTarget("css=.mw-searchSuggest-link:first-child");

  const suite = store.createSuite("aaa suite");
  suite.addTestCase(playbackTest);

  const suite2 = store.createSuite("aaab suite");
  suite2.addTestCase(typeTest);
  suite2.addTestCase(playbackTest2);

  UiState.selectTest(playbackTest);

  store.changeName("project");

  return store;
}
