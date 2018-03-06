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
import JSZip from "jszip";

export function migrateProject(zippedData) {
  return new Promise((res, rej) => {
    JSZip.loadAsync(zippedData).then(zip => {
      const isHidden = /(^\.|\/\.)/;
      const isHTML = /\.html$/;
      const files = zip.filter((relativePath, file) => (
        !file.dir && !isHidden.test(file.name) && isHTML.test(file.name)
      ));
      const fileMap = {};
      const project = {
        urls: [],
        tests: [],
        suites: []
      };
      Promise.all(files.map(file => (
        file.async("string").then(data => {
          fileMap[file.name] = data;
        })
      ))).then(() => {
        Object.keys(fileMap).filter(fileName => (
          fileMap[fileName].includes("table id=\"suiteTable\"")
        )).forEach(suite => {
          migrateSuite(suite, fileMap, project);
        });
        res(project);
      }).catch(rej);
    }).catch(rej);
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
      if (!testCaseExists(testCaseName, project.tests)) {
        const parsedTestCase = migrateTestCase(fileMap[testCaseName]);
        parsedTestCase.tests[0].id = testCaseName;
        project.tests.push(parsedTestCase.tests[0]);
        project.urls.push(parsedTestCase.urls[0]);
      }
      project.suites[0].tests.push(testCaseName);
    }
  });
}

export function migrateTestCase(data) {
  const sanitized = sanitizeXml(data);
  const result = JSON.parse(convert.xml2json(sanitized, { compact: true }));
  const project = {
    name: result.html.head.title._text,
    url: result.html.head.link._attributes.href,
    urls: [result.html.head.link._attributes.href],
    tests: [
      {
        id: data,
        name: result.html.body.table.thead.tr.td._text,
        commands: result.html.body.table.tbody.tr.map(row => (
          {
            command: row.td[0]._text || "",
            target: parseTarget(row.td[1]),
            value: row.td[2]._text || ""
          }
        ))
      }
    ],
    suites: []
  };

  return project;
}

function testCaseExists(testCase, tests) {
  return !!tests.find((test) => test.id === testCase.id);
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
