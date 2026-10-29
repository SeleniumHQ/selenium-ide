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

import path from 'path'
import { correctPluginPaths } from '../plugins'

describe('correctPluginPaths', () => {
  const projectPath = path.join('projects', 'project.side')
  it('should return no paths for a project without plugins', () => {
    expect(correctPluginPaths(projectPath, undefined)).toEqual([])
  })
  it('should resolve relative paths from the project folder', () => {
    expect(correctPluginPaths(projectPath, ['./plugin.js'])).toEqual([
      path.join('projects', 'plugin.js'),
    ])
  })
})
