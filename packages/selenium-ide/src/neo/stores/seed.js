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
  firstClick.setTargets([
    ["//div[@id='mw-content-text']/div/p[7]", "xpath:idRelative"]
  ]);
  const secondClick = playbackTest.createCommand();
  secondClick.setCommand("clickAt");
  secondClick.setTarget("link=parliamentary systems");

  const playbackTest2 = store.createTestCase("aab playback");
  const open2 = playbackTest2.createCommand();
  open2.setCommand("open");
  open2.setTarget("/wiki/River_Chater");
  const firstClick2 = playbackTest2.createCommand();
  firstClick2.setCommand("clickAt");
  firstClick2.setTarget("link=River Welland");
  const secondClick2 = playbackTest2.createCommand();
  secondClick2.setCommand("clickAt");
  secondClick2.setTarget("link=floods of 1947");
  const thirdClick2 = playbackTest2.createCommand();
  thirdClick2.setCommand("clickAt");
  thirdClick2.setTarget("link=scapegoat");
  const controlFlowIfTest = store.createTestCase("control flow if");
  controlFlowIfTest.createCommand(undefined, "if", "true");
  controlFlowIfTest.createCommand(undefined, "echo", "foo");
  controlFlowIfTest.createCommand(undefined, "elseIf", "true");
  controlFlowIfTest.createCommand(undefined, "echo", "bar");
  controlFlowIfTest.createCommand(undefined, "else");
  controlFlowIfTest.createCommand(undefined, "echo", "baz");
  controlFlowIfTest.createCommand(undefined, "end");

  const controlFlowElseIfTest = store.createTestCase("control flow else if");
  controlFlowElseIfTest.createCommand(undefined, "open", "/wiki/River_Chater");
  controlFlowElseIfTest.createCommand(undefined, "if", "false");
  controlFlowElseIfTest.createCommand(undefined, "echo", "foo");
  controlFlowElseIfTest.createCommand(undefined, "elseIf", "true");
  controlFlowElseIfTest.createCommand(undefined, "echo", "bar");
  controlFlowElseIfTest.createCommand(undefined, "else");
  controlFlowElseIfTest.createCommand(undefined, "echo", "baz");
  controlFlowElseIfTest.createCommand(undefined, "end");

  const controlFlowElseTest = store.createTestCase("control flow else");
  controlFlowElseTest.createCommand(undefined, "open", "/wiki/River_Chater");
  controlFlowElseTest.createCommand(undefined, "if", "false");
  controlFlowElseTest.createCommand(undefined, "echo", "foo");
  controlFlowElseTest.createCommand(undefined, "elseIf", "false");
  controlFlowElseTest.createCommand(undefined, "echo", "bar");
  controlFlowElseTest.createCommand(undefined, "else");
  controlFlowElseTest.createCommand(undefined, "echo", "baz");
  controlFlowElseTest.createCommand(undefined, "end");

  const controlFlowDoTest = store.createTestCase("control flow do");
  controlFlowDoTest.createCommand(undefined, "open", "/wiki/River_Chater");
  controlFlowDoTest.createCommand(undefined, "do");
  controlFlowDoTest.createCommand(undefined, "echo", "foo");
  controlFlowDoTest.createCommand(undefined, "repeatIf", "true", "2");

  const controlFlowTimesTest = store.createTestCase("control flow times");
  controlFlowTimesTest.createCommand(undefined, "open", "/wiki/River_Chater");
  controlFlowTimesTest.createCommand(undefined, "times", "2");
  controlFlowTimesTest.createCommand(undefined, "echo", "foo");
  controlFlowTimesTest.createCommand(undefined, "end");

  const controlFlowWhileTest = store.createTestCase("control flow while");
  controlFlowWhileTest.createCommand(undefined, "open", "/wiki/River_Chater");
  controlFlowWhileTest.createCommand(undefined, "while", "true", "2");
  controlFlowWhileTest.createCommand(undefined, "echo", "foo");
  controlFlowWhileTest.createCommand(undefined, "end");

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

  const executeScriptSandboxTest = store.createTestCase("execute script sandbox");
  executeScriptSandboxTest.createCommand(undefined, "executeScript", "return true", "blah");
  executeScriptSandboxTest.createCommand(undefined, "echo", "${blah}");
  executeScriptSandboxTest.createCommand(undefined, "verify", "${blah}", "false");
  executeScriptSandboxTest.createCommand(undefined, "assert", "${blah}", "true");

  const executeScriptContentWindowTest = store.createTestCase("execute script content window");
  executeScriptContentWindowTest.createCommand(undefined, "open", "/wiki/River_Chater");
  executeScriptContentWindowTest.createCommand(undefined, "executeScript", "return Math.random()", "blah");
  executeScriptContentWindowTest.createCommand(undefined, "echo", "${blah}");

  const suite = store.createSuite("aaa suite");
  suite.addTestCase(playbackTest);

  const suite2 = store.createSuite("aaab suite");
  suite2.addTestCase(typeTest);
  suite2.addTestCase(playbackTest2);

  const suiteControlFlow = store.createSuite("control flow");
  suiteControlFlow.addTestCase(controlFlowIfTest);
  suiteControlFlow.addTestCase(controlFlowElseIfTest);
  suiteControlFlow.addTestCase(controlFlowElseTest);
  suiteControlFlow.addTestCase(controlFlowDoTest);
  suiteControlFlow.addTestCase(controlFlowTimesTest);
  suiteControlFlow.addTestCase(controlFlowWhileTest);

  const suiteExecuteScript = store.createSuite("execute script");
  suiteExecuteScript.addTestCase(executeScriptSandboxTest);
  suiteExecuteScript.addTestCase(executeScriptContentWindowTest);

  const suiteAll = store.createSuite("_all tests");
  store.tests.forEach(function(test) {
    suiteAll.addTestCase(test);
  });

  UiState.changeView("Test suites");
  let suiteState = UiState.getSuiteState(suiteExecuteScript);
  suiteState.setOpen(true);
  UiState.selectTest(executeScriptSandboxTest, suiteExecuteScript);

  store.changeName("project");

  return store;
}
