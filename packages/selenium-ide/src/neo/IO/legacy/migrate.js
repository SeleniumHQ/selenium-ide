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

import convert from "xml-js";
import xmlescape from "xml-escape";
import xmlunescape from "unescape";
import JSZip from "jszip";
import { eliminate } from "./goto-elimination";

export function migrateProject(zippedData) {
  return JSZip.loadAsync(zippedData).then(zip => {
    const isHidden = /(^\.|\/\.)/;
    const isHTML = /\.html$/;
    const files = zip.filter((relativePath, file) => (
      !file.dir && !isHidden.test(file.name) && isHTML.test(file.name)
    ));
    const fileMap = {};
    const project = {
      url: "",
      urls: [],
      tests: [],
      suites: []
    };
    return Promise.all(files.map(file => (
      file.async("string").then(data => {
        fileMap[file.name] = data;
      })
    ))).then(() => {
      const suites = [];
      const tests = [];
      Object.keys(fileMap).forEach(fileName => {
        if (fileMap[fileName].includes("table id=\"suiteTable\"")) {
          suites.push(fileName);
        } else {
          tests.push(fileName);
        }
      });
      tests.forEach(testCaseName => {
        const parsedTestCase = migrateTestCase(fileMap[testCaseName]);
        parsedTestCase.tests[0].id = testCaseName;
        project.tests.push(parsedTestCase.tests[0]);
        project.urls = [...project.urls, ...parsedTestCase.urls];
      });
      suites.forEach(suite => {
        migrateSuite(suite, fileMap, project);
      });
      if (!suites.length) {
        project.suites.push({
          name: "Imported suite",
          tests
        });
        project.name = "Imported project";
      }
      return project;
    });
  });
}

function migrateSuite(suite, fileMap, project) {
  const result = JSON.parse(convert.xml2json(fileMap[suite], { compact: true }));
  const parsedSuite = {
    id: suite,
    name: result.html.head.title._text,
    tests: []
  };
  project.suites.push(parsedSuite);
  result.html.body.table.tbody.tr.forEach(testCase => {
    if (testCase.td.a) {
      const testCaseName = testCase.td.a._attributes.href;
      if (!fileMap[testCaseName]) {
        throw new Error(`The file ${testCaseName} is missing, suite can't be migrated`);
      }
      parsedSuite.tests.push(testCaseName);
      project.name = parsedSuite.name;
    }
  });
}

export function migrateTestCase(data) {
  const sanitized = sanitizeXml(data);
  const result = JSON.parse(convert.xml2json(sanitized, { compact: true }));
  const project = {
    name: result.html.head.title._text,
    url: result.html.head.link._attributes.href,
    urls: result.html.head.link._attributes.href ? [result.html.head.link._attributes.href] : [],
    tests: [
      {
        id: data,
        name: result.html.body.table.thead.tr.td._text,
        commands: eliminate(result.html.body.table.tbody.tr.filter(row => (row.td[0]._text && !/^wait/.test(row.td[0]._text))).map(row => (
          {
            command: row.td[0]._text && row.td[0]._text.replace("AndWait", ""),
            target: xmlunescape(parseTarget(row.td[1])),
            value: xmlunescape(row.td[2]._text || "")
          }
        )))
      }
    ],
    suites: []
  };

  return project;
}

function sanitizeXml(data) {
  return data.replace(/<link(.*")\s*\/{0}>/g, (match, group) => (
    `<link${group} />`
  )).replace(/<td>(.*)<\/td>/g, (match, group) => (
    `<td>${xmlescape(group)}</td>`
  ));
}

function parseTarget(targetCell) {
  if (targetCell._text) {
    if (targetCell._text instanceof Array) {
      return targetCell._text.join("<br />");
    } else {
      return targetCell._text;
    }
  } else {
    return "";
  }
}
