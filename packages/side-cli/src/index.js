#!/usr/bin/env node

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

import fs from 'fs'
import React from 'react'
import { render } from 'ink'
import PlaybackComponent from './components/playback'
import { Playback, WebDriverExecutor } from '@seleniumhq/side-runtime'

const projectPath = process.argv[2]
const project = JSON.parse(fs.readFileSync(projectPath).toString())
const executor = new WebDriverExecutor()
const playback = new Playback({ executor, baseUrl: project.url })
render(<PlaybackComponent project={project} playback={playback} />)
