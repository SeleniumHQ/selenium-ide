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

// Sets every package in packages/ to one version, and the versions the
// packages use of each other to the same version.
//
//   node scripts/set-version.mjs 4.1.0-beta.1
//
// Run `pnpm install` afterwards to update the lockfile.
//
// With --check, changes nothing and fails if a package has another version:
//
//   node scripts/set-version.mjs --check 4.1.0-beta.1
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const args = process.argv.slice(2)
const check = args[0] === '--check'
const version = check ? args[1] : args[0]
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  console.error('Usage: node scripts/set-version.mjs [--check] <version>')
  process.exit(1)
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = path.join(root, 'packages')
const files = fs
  .readdirSync(packagesDir)
  .map((name) => path.join(packagesDir, name, 'package.json'))
  .filter((file) => fs.existsSync(file))
const packages = files.map((file) => ({
  file,
  json: JSON.parse(fs.readFileSync(file, 'utf8')),
}))
const names = new Set(packages.map(({ json }) => json.name))

if (check) {
  const wrong = packages.filter(({ json }) => json.version !== version)
  for (const { json } of wrong) {
    console.error(`${json.name} is ${json.version}, expected ${version}`)
  }
  process.exit(wrong.length ? 1 : 0)
}

for (const { file, json } of packages) {
  json.version = version
  for (const field of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    for (const name of Object.keys(json[field] ?? {})) {
      if (names.has(name)) json[field][name] = version
    }
  }
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
  console.log(`${json.name} ${version}`)
}
