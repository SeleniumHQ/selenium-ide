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

import { spawn } from 'child_process'

// TODO: rename this since we aren't actually spawning sh
export async function sh(
  command: string,
  args: string[] = [],
  options?: object
): Promise<Output> {
  let resolve: (value: Output) => void, reject: (reason: Error & Output) => void
  const p = new Promise<Output>((res, rej) => {
    resolve = res
    reject = rej
  })

  let stdout = '',
    stderr = ''
  const cp = spawn(command, args, options)

  cp.stdout.on('data', data => {
    stdout += data.toString()
  })

  cp.stderr.on('data', data => {
    stderr += data.toString()
  })

  cp.on('close', (code: number) => {
    if (!code) {
      resolve({ stdout, stderr })
    } else {
      reject(
        makeError(`Process exited with code ${code}`, code, stdout, stderr)
      )
    }
  })

  cp.on('error', error => {
    reject(makeError(error.message, 1, stdout, stderr))
  })

  return await p
}

export function makeError(
  message: string,
  code: number,
  stdout: string,
  stderr: string
) {
  const err = new Error(message) as Error & Output & ErrorWithExitCode
  err.stdout = stdout
  err.stderr = stderr
  err.code = code

  return err
}

interface Output {
  stdout: string
  stderr: string
}

interface ErrorWithExitCode {
  code: number
}
