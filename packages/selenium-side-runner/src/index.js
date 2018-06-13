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

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fork } from "child_process";
import program from "commander";
import winston from "winston";
import rimraf from "rimraf";
import { js_beautify as beautify } from "js-beautify";
import Capabilities from "./capabilities";
import Config from "./config";
import { install } from "./npm";
import metadata from "../package.json";

process.title = metadata.name;

program
  .usage("[options] project.side [project.side] [*.side]")
  .version(metadata.version)
  .option("-c, --capabilities [list]", "Webdriver capabilities")
  .option("-s, --server [url]", "Webdriver remote server")
  .option("-p, --params [list]", "General parameters")
  .option("-f, --filter [string]", "Filter test cases by name")
  .option("-w, --max-workers [number]", "Maximum amount of workers that will run your tests, defaults to number of cores")
  .option("--base-url [url]", "Override the base URL that was set in the IDE")
  .option("--configuration-file [filepath]", "Use specified YAML file for configuration. (default: .side.yml)")
  .option("--debug", "Print debug logs")
  .parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
  process.exit(1);
}

winston.cli();
winston.level = program.debug ? "debug" : "warn";

const configuration = {
  capabilities: {
    browserName: "chrome"
  },
  params: {},
  runId: crypto.randomBytes(16).toString("hex"),
  path: path.join(__dirname, "../../")
};

const configurationFilePath = program.configurationFile || ".side.yml";
try {
  Object.assign(configuration, Config.load(path.join(process.cwd(), configurationFilePath)));
} catch (e) {
  winston.info("Could not load .side.yml");
}

configuration.server = program.server ? program.server : configuration.server;

if (program.capabilities) {
  try {
    Object.assign(configuration.capabilities, Capabilities.parseString(program.capabilities));
  } catch (e) {
    winston.info("Failed to parse inline capabilities");
  }
}

if (program.params) {
  try {
    Object.assign(configuration.params, Capabilities.parseString(program.params));
  } catch (e) {
    winston.info("Failed to parse additional params");
  }
}

configuration.baseUrl = program.baseUrl ? program.baseUrl : configuration.baseUrl;

function runProject(project) {
  if (!project.code || project.version !== "1.0") {
    return Promise.reject(new TypeError(`The project ${project.name} is of older format, open and save it again using the IDE.`));
  }
  const projectPath = `side-suite-${project.name}`;
  rimraf.sync(projectPath);
  fs.mkdirSync(projectPath);
  process.chdir(projectPath);
  fs.writeFileSync("package.json", JSON.stringify({
    name: project.name,
    version: "0.0.0",
    jest: {
      modulePaths: [path.join(__dirname, "../node_modules")],
      setupTestFrameworkScriptFile: require.resolve("jest-environment-selenium/dist/setup.js"),
      testEnvironment: "jest-environment-selenium",
      testEnvironmentOptions: configuration
    },
    dependencies: project.dependencies || {}
  }));
  project.code.forEach(suite => {
    if (!suite.tests) {
      // not parallel
      writeJSFile(suite.name, suite.code);
    } else if (suite.tests.length) {
      fs.mkdirSync(suite.name);
      // parallel suite
      suite.tests.forEach(test => {
        writeJSFile(path.join(suite.name, test.name), `${suite.code}${test.code}`);
      });
    }
  });
  winston.info(`Running ${project.name}`);

  return new Promise((resolve, reject) => {
    let npmInstall;
    if (project.dependencies && Object.keys(project.dependencies)) {
      npmInstall = install();
    } else {
      npmInstall = Promise.resolve();
    }
    npmInstall.then(() => {
      const child = fork(require.resolve("./child"), [
        "--testMatch", "**/*.test.js"
      ].concat(program.filter ? ["-t", program.filter] : [])
        .concat(program.maxWorkers ? ["-w", program.maxWorkers] : []), { stdio: "inherit" });

      child.on("exit", (code) => {
        console.log("");
        process.chdir("..");
        rimraf.sync(projectPath);
        if (code) {
          reject();
        } else {
          resolve();
        }
      });
    });
  });
}

function runAll(projects, index = 0) {
  if (index >= projects.length) return Promise.resolve();
  return runProject(projects[index]).then(() => {
    return runAll(projects, ++index);
  }).catch((error) => {
    process.exitCode = 1;
    error && winston.error(error.message + "\n");
    return runAll(projects, ++index);
  });
}

function writeJSFile(name, data) {
  fs.writeFileSync(`${name}.test.js`, beautify(data, { indent_size: 2 }));
}

const projects = program.args.map(p => JSON.parse(fs.readFileSync(p)));

runAll(projects);
