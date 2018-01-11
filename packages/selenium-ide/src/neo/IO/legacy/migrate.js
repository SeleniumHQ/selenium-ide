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

export default function migrateProject(data) {
  const result = JSON.parse(convert.xml2json(data, { compact: true }));
  const project = {
    name: result.html.head.title._text,
    url: result.html.head.link._attributes.href,
    urls: [result.html.head.link._attributes.href],
    tests: [
      {
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
