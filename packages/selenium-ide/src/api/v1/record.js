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

import browser from "webextension-polyfill";
import Router from "../../router";
import { Commands } from "../../neo/models/Command";
import { recordCommand } from "../../neo/IO/SideeX/record";
import { select } from "../../neo/IO/SideeX/find-select";
import { extCommand } from "../../neo/IO/SideeX/playback";

const router = new Router();

router.get("/tab", (req, res) => {
  browser.tabs.query({
    active: true,
    windowId: extCommand.getContentWindowId()
  }).then((tabs) => {
    if (!tabs.length) {
      res({ error: "No active tab found" });
    } else {
      res({ id: tabs[0].id });
    }
  });
});

router.post("/command", (req, res) => {
  recordCommand(req.command, req.target, req.value, undefined, req.select);
  const type = Commands.list.has(req.command) && Commands.list.get(req.command).type;
  if (req.select && type) {
    select(type, undefined, true);
  }
  res(true);
});

export default router;
