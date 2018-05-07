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

import { RegisterConfigurationHook, RegisterSuiteHook, RegisterTestHook, RegisterEmitter } from "selianize";
import { Commands } from "../neo/models/Command";
import { registerCommand } from "./commandExecutor";
import { sendMessage } from "./communication";

function RunCommand(id, command, target, value, options) {
  return sendMessage(id, {
    action: "execute",
    command: {
      command,
      target,
      value
    },
    options
  });
}

class PluginManager {
  constructor() {
    this.plugins = [];
    RegisterConfigurationHook((project) => {
      return new Promise((res) => {
        Promise.all(this.plugins.map(plugin => this.emitConfiguration(plugin.id, project).catch((e) => {console.log(e); return "";}))).then(configs => (
          res(configs.join(""))
        ));
      });
    });
  }

  registerPlugin(plugin) {
    if (!this.hasPlugin(plugin.id)) {
      this.plugins.push(plugin);
      RegisterSuiteHook(this.emitSuite.bind(undefined, plugin.id));
      RegisterTestHook(this.emitTest.bind(undefined, plugin.id));
      if (plugin.commands) {
        plugin.commands.forEach(({id, name, type}) => {
          Commands.addCommand(id, { name, type });
          registerCommand(id, RunCommand.bind(undefined, plugin.id, id));
          RegisterEmitter(id, this.emitCommand.bind(undefined, plugin.id, id));
        });
      }
    } else {
      throw new Error("This plugin is already registered");
    }
  }

  hasPlugin(pluginId) {
    return !!this.plugins.find(p => p.id === pluginId);
  }

  getPlugin(pluginId) {
    return this.plugins.find(p => p.id === pluginId);
  }

  emitConfiguration(pluginId, project) {
    return sendMessage(pluginId, {
      action: "emit",
      entity: "config",
      project
    }).then(res => res.message);
  }

  emitSuite(pluginId, suiteInfo) {
    return sendMessage(pluginId, {
      action: "emit",
      entity: "suite",
      suite: suiteInfo
    }).catch(() => ({}));
  }

  emitTest(pluginId, test) {
    return sendMessage(pluginId, {
      action: "emit",
      entity: "test",
      test
    }).catch(() => ({}));
  }

  emitCommand(pluginId, command, target, value) {
    return sendMessage(pluginId, {
      action: "emit",
      entity: "command",
      command: {
        command,
        target,
        value
      }
    }).then(res => res.message);
  }

  emitMessage(message) {
    return Promise.all(this.plugins.map(plugin => (
      sendMessage(plugin.id, message).catch((err) => (Promise.resolve(err)))
    )));
  }
}

export default new PluginManager();
