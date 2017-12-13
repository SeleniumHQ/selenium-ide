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

import { spy } from "mobx";

function isDomainModel(object) {
  return (object && (
    object.constructor.name === "ProjectStore" ||
    object.constructor.name === "Suite" ||
    object.constructor.name === "TestCase" ||
    object.constructor.name === "Command"
  ));
}

export default function(project) {
  let disposer = spy((event) => {
    if (!project.modified && isDomainModel(event.object) && event.type === "action" && event.name !== "setModified") {
      project.setModified();
    } else if (project.modified) {
      setTimeout(disposer, 0);
    }
  });
}
