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

// Exports every project in tests/examples (and ./projects) to Java and C#, and compiles the
// result with Maven and dotnet. Run it after building the packages.
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..', '..')
// The examples, plus projects with names that are hard to export
const projects = [
  path.join(root, 'tests', 'examples'),
  path.join(here, 'projects'),
]
const exportBin = path.join(
  root,
  'packages',
  'side-code-export',
  'dist',
  'bin.js'
)

const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

// Exports each example into its own folder, then copies the files into the
// project. Each example gets its own package or namespace, because examples
// can have suites with the same name.
function exportExamples(language, target, addScope) {
  fs.rmSync(target, { recursive: true, force: true })
  const files = projects.flatMap((folder) =>
    fs.readdirSync(folder).map((file) => path.join(folder, file))
  )
  for (const sideFile of files) {
    if (!sideFile.endsWith('.side')) continue
    const file = path.basename(sideFile)
    const scope = 'example_' + path.basename(file, '.side').replace(/\W/g, '_')
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'side-export-'))
    execFileSync(process.execPath, [
      exportBin,
      path.join(
        root,
        'packages',
        `code-export-${language}`,
        'dist',
        'index.js'
      ),
      sideFile,
      out,
    ])
    for (const exported of fs.readdirSync(out)) {
      const code = fs.readFileSync(path.join(out, exported), 'utf8')
      const folder = path.join(target, scope)
      fs.mkdirSync(folder, { recursive: true })
      fs.writeFileSync(path.join(folder, exported), addScope(code, scope))
    }
    fs.rmSync(out, { recursive: true, force: true })
  }
}

// A package statement can go first, after the comment
const javaPackage = (code, scope) => `package ${scope};\n${code}`

// A file-scoped namespace goes after the using lines
function csharpNamespace(code, scope) {
  const lines = code.split('\n')
  const lastUsing = lines.findLastIndex((line) => line.startsWith('using '))
  lines.splice(lastUsing + 1, 0, `namespace ${scope};`)
  return lines.join('\n')
}

exportExamples(
  'java-junit',
  path.join(here, 'java', 'src', 'test', 'java'),
  javaPackage
)
run('mvn', ['-q', '-B', 'test-compile'], path.join(here, 'java'))

for (const language of ['csharp-nunit', 'csharp-xunit']) {
  const project = path.join(here, language)
  exportExamples(language, path.join(project, 'exported'), csharpNamespace)
  run('dotnet', ['build', '-nologo', '-v', 'q'], project)
}
