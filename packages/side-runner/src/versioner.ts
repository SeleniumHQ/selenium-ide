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

import semver, { SemVer } from 'semver'

export default function Satisfies(strGolden: string, strVersion: string) {
  const golden = semver.coerce(strGolden) as SemVer
  const version = semver.coerce(strVersion) as SemVer
  if (strGolden === strVersion) {
    return
  } else if (semver.satisfies(version, `^${semver.major(golden)}`)) {
    return semver.gt(version, golden)
      ? 'project file is older than recommended, in case of issues upgrade the project via the IDE'
      : 'runner is older than project file, in case of issues upgrade the runner using: `npm i -g selenium-side-runner@latest`'
  } else {
    throw new Error(
      semver.gt(version, golden)
        ? 'project file is too old for the runner, upgrade the project via the IDE (or use --force)'
        : 'runner is too old to run the project file, upgrade the runner using: `npm i -g selenium-side-runner@latest`'
    )
  }
}
