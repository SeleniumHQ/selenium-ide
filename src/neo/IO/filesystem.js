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

import migrateProject from "./legacy/migrate";
import UiState from "../stores/view/UiState";
const browser = window.browser;

export const supportedFileFormats = ".side, text/html";

export function saveProject(project) {
  project.version = "1.0";
  downloadProject(project);
  UiState.saved();
}

function downloadProject(project) {
  browser.downloads.download({
    filename: project.name + ".side",
    url: createBlob("application/json", project.toJSON()),
    saveAs: true,
    conflictAction: "overwrite"
  });
}

let previousFile = null;
function createBlob(mimeType, data) {
  const blob = new Blob([data], {
    type: "text/plain"
  });
  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (previousFile !== null) {
    window.URL.revokeObjectURL(previousFile);
  }
  previousFile = window.URL.createObjectURL(blob);
  return previousFile;
}

export function loadProject(project, file) {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (/\.side$/.test(file.name)) {
      loadJSONProject(project, e.target.result);
    } else if (file.type === "text/html") {
      project.fromJS(migrateProject(e.target.result));
    }
  };

  fileReader.readAsText(file);
}

function loadJSONProject(project, data) {
  project.fromJS(JSON.parse(data));
}
