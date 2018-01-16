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

import Manager from "../../plugin/manager";
import { canExecuteCommand } from "../../plugin/commandExecutor";
import { Commands } from "../../neo/models/command";

describe("plugin manager", () => {
  it("should have a list of active plugins", () => {
    expect(Manager.plugins).toBeDefined();
  });
  it("should register a plugin", () => {
    const plugin = {
      id: "1",
      name: "an extension from the store",
      version: "1.0.0",
      commands: [{
        id: "aCommand",
        name: "do something"
      }]
    };
    expect(Manager.plugins.length).toBe(0);
    Manager.registerPlugin(plugin);
    expect(Manager.plugins.length).toBe(1);
    expect(canExecuteCommand(plugin.commands[0].id)).toBeTruthy();
    expect(Commands.list.has(plugin.commands[0].id)).toBeTruthy();
  });
});
