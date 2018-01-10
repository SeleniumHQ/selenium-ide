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
import jest from "jest";
import winston from "winston";
import Capabilities from "./capabilities";
import Config from "./config";
import metadata from "../package.json";

process.title = metadata.name;

program
  .version(metadata.version)
  .option("-c, --capabilities [list]", "Webdriver capabilities")
  .option("--no-sideyml", "Disabled the use of .side.yml")
  .option("--debug", "Print debug logs")
  .parse(process.argv);

winston.level = program.debug ? "debug" : "warn";

const configuration = {
  capabilities: {
    browserName: "chrome"
  },
  path: path.join(__dirname, "../../")
};
if (program.sideyml) {
  try {
    Object.assign(configuration, Config.load(path.join(process.cwd(), ".side.yml")));
  } catch (e) {
    winston.info("Could not load .side.yml");
  }
}

if (program.capabilities) {
  try {
    Object.assign(configuration.capabilities, Capabilities.parseString(program.capabilities));
  } catch (e) {
    winston.info("Failed to parse inline capabilities");
  }
}

process.env.configuration = JSON.stringify(configuration);
let testPath = program.args.length ? program.args[0] : "**/*.test.js";
jest.run(["--setupFiles", path.join(__dirname, "setup.js"), "--testEnvironment", "node", "--modulePaths", path.join(__dirname, "../node_modules"), "--testMatch", testPath]);
