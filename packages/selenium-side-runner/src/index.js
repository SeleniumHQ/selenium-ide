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
import Selianize from "selianize";
import Capabilities from "./capabilities";
import Config from "./config";
import metadata from "../package.json";

const DEFAULT_TIMEOUT = 15000;

process.title = metadata.name;

program
  .usage("[options] project.side [project.side] [*.side]")
  .version(metadata.version)
  .option("-c, --capabilities [list]", "Webdriver capabilities")
  .option("-s, --server [url]", "Webdriver remote server")
  .option("-p, --params [list]", "General parameters")
  .option("-f, --filter [string]", "Run suites matching name")
  .option("-w, --max-workers [number]", "Maximum amount of workers that will run your tests, defaults to number of cores")
  .option("--base-url [url]", "Override the base URL that was set in the IDE")
  .option("--timeout [number | undefined]", `The maximimum amount of time, in milliseconds, to spend attempting to locate an element. (default: ${DEFAULT_TIMEOUT})`)
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
  winston.info("Could not load " + configurationFilePath);
}

program.filter = program.filter || "*";
configuration.server = program.server ? program.server : configuration.server;

configuration.timeout = program.timeout ? +program.timeout
  : configuration.timeout ? +configuration.timeout
  : DEFAULT_TIMEOUT; // eslint-disable-line indent

if (configuration.timeout === "undefined") configuration.timeout = undefined;

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

let projectPath;

function runProject(project) {
  if (project.version !== "1.0") {
    return Promise.reject(new TypeError(`The project ${project.name} is of older format, open and save it again using the IDE.`));
  }
  projectPath = `side-suite-${project.name}`;
  rimraf.sync(projectPath);
  fs.mkdirSync(projectPath);
  fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify({
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

  return Selianize(project, { silenceErrors: true }).then((code) => {
    const tests = code.tests.reduce((tests, test) => {
      return tests += test.code;
    }, "const tests = {};").concat("module.exports = tests;");
    writeJSFile(path.join(projectPath, "commons"), tests, ".js");
    code.suites.forEach(suite => {
      if (!suite.tests) {
        // not parallel
        const cleanup = suite.persistSession ? "" : "beforeEach(() => {vars = {};});afterEach(async () => (cleanup()));";
        writeJSFile(path.join(projectPath, suite.name), `// This file was generated using Selenium IDE\nconst tests = require("./commons.js");${code.globalConfig}${suite.code}${cleanup}`);
      } else if (suite.tests.length) {
        fs.mkdirSync(path.join(projectPath, suite.name));
        // parallel suite
        suite.tests.forEach(test => {
          writeJSFile(path.join(projectPath, suite.name, test.name), `// This file was generated using Selenium IDE\nconst tests = require("../commons.js");${code.globalConfig}${suite.code}${test.code}`);
        });
      }
    });
    winston.info(`Running ${project.name}`);

    return new Promise((resolve, reject) => {
      let npmInstall;
      if (project.dependencies && Object.keys(project.dependencies).length) {
        npmInstall = new Promise((resolve, reject) => {
          const child = fork(require.resolve("./npm"), { cwd: path.join(process.cwd(), projectPath), stdio: "inherit" });
          child.on("exit", (code) => {
            if (code) {
              reject();
            } else {
              resolve();
            }
          });
        });
      } else {
        npmInstall = Promise.resolve();
      }
      npmInstall.then(() => {
        const child = fork(require.resolve("./child"), [
          "--testMatch", `{**/*${program.filter}*/*.test.js,**/*${program.filter}*.test.js}`
        ].concat(program.maxWorkers ? ["-w", program.maxWorkers] : []), { cwd: path.join(process.cwd(), projectPath), stdio: "inherit" });

        child.on("exit", (code) => {
          console.log("");
          rimraf.sync(projectPath);
          if (code) {
            reject();
          } else {
            resolve();
          }
        });
      }).catch(reject);
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

function writeJSFile(name, data, postfix = ".test.js") {
  fs.writeFileSync(`${name}${postfix}`, beautify(data, { indent_size: 2 }));
}

const projects = program.args.map(p => JSON.parse(fs.readFileSync(p)));

function handleQuit(signal, code) { // eslint-disable-line no-unused-vars
  rimraf.sync(projectPath);
  process.exit(code);
}

process.on("SIGINT", handleQuit);
process.on("SIGTERM", handleQuit);

runAll(projects);
