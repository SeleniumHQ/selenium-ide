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

import * as path from 'path'
import * as fs from 'fs-extra'
import * as stream from 'stream'
import fetch from 'node-fetch'
import * as unzipper from 'unzipper'
import tar from 'tar'
import {
  resolveDriverUrl,
  resolveDriverName,
  Browser,
  Platform,
} from './resolve-driver'
import { Arch } from './types'

type Response = Awaited<ReturnType<typeof fetch>>

const processDownloadResonse = (
  url: string,
  destination: string,
  response: Response
) =>
  new Promise((resolve, reject) => {
    if (!response.ok) {
      reject(new Error('Failed to download driver from url: ' + url))
    }
    if (url.endsWith('.zip')) {
      response?.body?.pipe(unzipper.Parse()).pipe(
        new stream.Transform({
          objectMode: true,
          transform: (entry, _e, cb) => {
            const fileName = entry.path.split(path.sep).pop()
            if (
              fileName === 'chromedriver' ||
              fileName === 'chromedriver.exe' ||
              fileName === 'geckodriver' ||
              fileName === 'geckodriver.exe'
            ) {
              entry
                .pipe(fs.createWriteStream(destination))
                .on('error', reject)
                .on('finish', () => {
                  cb()
                  resolve(null)
                })
            } else {
              entry.autodrain()
              cb()
            }
          },
        })
      )
    } else {
      response?.body?.pipe(
        tar.t({
          filter: (path, _stat) => path === 'geckodriver',
          onentry: (entry) => {
            entry.pipe(fs.createWriteStream(destination)).on('close', resolve)
          },
        })
      )
    }
  })

export default async function downloadDriver({
  downloadDirectory,
  browser,
  platform,
  arch,
  version,
  artifactName,
}: {
  downloadDirectory: string
  browser: Browser
  platform: Platform
  arch: Arch
  version: string
  artifactName?: string
}) {
  const url = await resolveDriverUrl({ browser, platform, arch, version })
  const downloadDestination = path.join(
    downloadDirectory,
    artifactName || resolveDriverName({ browser, platform, version })
  )
  console.log(`Downloading driver from ${url} to ${downloadDestination}`)
  const res = await fetch(url)
  await processDownloadResonse(url, downloadDestination, res)
  await fs.chmod(downloadDestination, 0o755)
  console.log(`Downloaded driver from ${url} to ${downloadDestination}`)
  return downloadDestination
}
