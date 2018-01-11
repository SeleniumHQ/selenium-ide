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

import webdriver from "selenium-webdriver";

const Runner = {};
const drivers = [];
Runner.configuration = JSON.parse(process.env.configuration);
Runner.buildDriver = function() {
  const driver = new webdriver.Builder().withCapabilities(Runner.configuration.capabilities);

  if (Runner.configuration.server) driver.usingServer(Runner.configuration.server);

  return driver.build();
};

Runner.getDriver = function() {
  const driver = Runner.buildDriver();
  drivers.push(driver);
  return driver;
};

Runner.releaseDriver = function(driver) {
  drivers.splice(drivers.indexOf(driver), 1);
  driver.quit();
};

Runner.cleaup = function() {
  if (drivers.length) {
    drivers.forEach(driver => {
      driver.quit();
    });
  }
};

global.Runner = Runner;
