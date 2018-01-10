#!/usr/bin/env node

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

import path from "path";
import program from "commander";
import Capabilities from "./capabilities";
import Config from "./config";
import metadata from "../package.json";

process.title = metadata.name;

program
  .version(metadata.version)
  .option("-c, --capabilities [value]", "Webdriver capabilities")
  .option("--no-sideyml", "Disabled the use of .side.yml")
  .parse(process.argv);

const configuration = {
  capabilities: {
    browserName: "chrome"
  }
};
if (program.sideyml) {
  try {
    Object.assign(configuration, Config.load(path.join(process.cwd(), ".side.yml")));
  } catch (e) {
    console.log("could not load .side.yml");
  }
}

if (program.capabilities) {
  try {
    Object.assign(configuration.capabilities, Capabilities.parseString(program.capabilities));
  } catch (e) {
    console.log("failed to parse inline capabilities");
  }
}
