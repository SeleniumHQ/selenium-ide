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
import parser from "ua-parser-js";
import { migrateTestCase, migrateProject } from "./legacy/migrate";
import UiState from "../stores/view/UiState";
import ModalState from "../stores/view/ModalState";
import Selianize, { ParseError } from "selianize";
import chromeGetFile from "./filesystem/chrome";
import firefoxGetFile from "./filesystem/firefox";

export const supportedFileFormats = ".side, text/html, application/zip";
const parsedUA = parser(window.navigator.userAgent);

export function getFile(path) {
  const browserName = parsedUA.browser.name;
  return (() => {
    if (browserName === "Chrome") {
      return chromeGetFile(path);
    } else if (browserName === "Firefox") {
      return firefoxGetFile(path);
    } else {
      return Promise.reject(new Error("Operation is not supported in this browser"));
    }
  })().then(blob => {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        res(reader.result);
      });
      reader.readAsDataURL(blob);
    });
  });
}

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

export function exportProject(project) {
  Selianize(JSON.parse(project.toJSON())).then(data => {
    browser.downloads.download({
      filename: project.name + ".test.js",
      url: createBlob("application/javascript", data),
      saveAs: true,
      conflictAction: "overwrite"
    });
  }).catch(err => {
    const markdown = ParseError(err && err.message || err);
    ModalState.showAlert({
      title: "Error exporting project",
      description: markdown,
      confirmLabel: "Download log",
      cancelLabel: "Close"
    }, (choseDownload) => {
      if (choseDownload) {
        browser.downloads.download({
          filename: project.name + "-logs.md",
          url: createBlob("text/markdown", markdown),
          saveAs: true,
          conflictAction: "overwrite"
        });
      }
    });
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
  function displayError(error) {
    ModalState.showAlert({
      title: "Error migrating project",
      description: error.message,
      confirmLabel: "Close"
    });
  }
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (/\.side$/.test(file.name)) {
      loadJSONProject(project, e.target.result);
    } else  {
      try {
        if (file.type === "text/html") {
          project.fromJS(migrateTestCase(e.target.result));
        } else if (file.type === "application/zip") {
          migrateProject(e.target.result).then(jsRep => {
            project.fromJS(jsRep);
          }).catch(displayError);
        }
      } catch (error) {
        displayError(error);
      }
    }
  };

  file.type === "application/zip" ? fileReader.readAsArrayBuffer(file) : fileReader.readAsText(file);
}

function loadJSONProject(project, data) {
  project.fromJS(JSON.parse(data));
}
