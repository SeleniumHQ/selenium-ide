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

import { PassThrough } from 'stream'
import { pickTest } from '../pick-test'
import { Project } from '../types'

const project = (name: string, tests: string[]) =>
  ({
    name,
    path: `/projects/${name}.side`,
    tests: tests.map((test) => ({ id: `${name}-${test}`, name: test })),
  }) as unknown as Project

const run = async (projects: Project[], answers: string[]) => {
  const input = new PassThrough()
  const output = new PassThrough()
  let printed = ''
  output.on('data', (chunk) => (printed += chunk))
  const picked = pickTest(projects, input, output)
  for (const answer of answers) {
    await new Promise((resolve) => setImmediate(resolve))
    input.write(answer + '\n')
  }
  return { picked: await picked, printed }
}

describe('test picker', () => {
  it('lists the tests and returns the one picked', async () => {
    const { picked, printed } = await run(
      [project('shop', ['login', 'checkout'])],
      ['2']
    )
    expect(printed).toContain('  1) login\n')
    expect(printed).toContain('  2) checkout\n')
    expect(picked).toEqual({
      projectPath: '/projects/shop.side',
      testId: 'shop-checkout',
    })
  })
  it('shows the project name when there are several projects', async () => {
    const { picked, printed } = await run(
      [project('shop', ['login']), project('blog', ['post'])],
      ['2']
    )
    expect(printed).toContain('  1) shop › login\n')
    expect(printed).toContain('  2) blog › post\n')
    expect(picked.testId).toBe('blog-post')
  })
  it('asks again after an answer that is not on the list', async () => {
    const { picked, printed } = await run(
      [project('shop', ['login', 'checkout'])],
      ['3', 'x', '1']
    )
    expect(printed.match(/Type a number from 1 to 2/g)).toHaveLength(2)
    expect(picked.testId).toBe('shop-login')
  })
  it('fails when there are no tests', async () => {
    await expect(pickTest([project('empty', [])])).rejects.toThrow(
      'No tests found'
    )
  })
})
