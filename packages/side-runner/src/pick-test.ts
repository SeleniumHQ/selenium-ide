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

import readline from 'readline/promises'
import { Project } from './types'

export interface PickedTest {
  projectPath: string
  testId: string
}

// Lists the tests of every project and asks which one to run
export const pickTest = async (
  projects: Project[],
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout
): Promise<PickedTest> => {
  const choices = projects.flatMap((project) =>
    project.tests.map((test) => ({
      label: projects.length > 1 ? `${project.name} › ${test.name}` : test.name,
      projectPath: project.path,
      testId: test.id,
    }))
  )
  if (!choices.length) {
    throw new Error('No tests found in the supplied projects')
  }
  choices.forEach((choice, index) => {
    output.write(`${String(index + 1).padStart(3)}) ${choice.label}\n`)
  })
  const rl = readline.createInterface({ input, output })
  try {
    for (;;) {
      const answer = (await rl.question('Test to run (number): ')).trim()
      const index = Number(answer) - 1
      if (Number.isInteger(index) && choices[index]) {
        const { projectPath, testId } = choices[index]
        return { projectPath, testId }
      }
      output.write(`Type a number from 1 to ${choices.length}\n`)
    }
  } finally {
    rl.close()
  }
}
