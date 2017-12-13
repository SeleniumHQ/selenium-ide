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

export default function seed(store) {
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
  const numberOfSuites = 5;
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
  open.setCommand("open");
  open.setTarget("/wiki/Legislation");
  const firstClick = playbackTest.createCommand();
  firstClick.setCommand("clickAt");
  firstClick.setTarget("link=enacted");
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

  const suite = store.createSuite("aaa suite");
  suite.addTestCase(playbackTest);
  suite.addTestCase(playbackTest2);

  UiState.selectTest(playbackTest);

  return store;
}
