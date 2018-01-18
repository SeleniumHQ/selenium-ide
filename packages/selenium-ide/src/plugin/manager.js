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

import { Commands } from "../neo/models/Command";
import { registerCommand } from "./commandExecutor";
import sendMessage from "./communication";

function RunCommand(id, command, target, value) {
  return sendMessage(id, {
    action: "execute",
    command: {
      command,
      target,
      value
    }
  });
}

class PluginManager {
  plugins = [];

  registerPlugin(plugin) {
    if (!this.hasPlugin(plugin.id)) {
      this.plugins.push(plugin);
      if (plugin.commands) {
        plugin.commands.forEach(({id, name}) => {
          Commands.addCommand(id, name);
          registerCommand(id, RunCommand.bind(undefined, plugin.id, id));
        });
      }
    } else {
      throw new Error("This plugin is already registered");
    }
  }

  hasPlugin(pluginId) {
    return !!this.plugins.find(p => p.id === pluginId);
  }
}

export default new PluginManager();
