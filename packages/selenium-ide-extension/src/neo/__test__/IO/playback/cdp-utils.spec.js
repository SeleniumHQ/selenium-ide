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

import { buildFrameTree } from '../../../IO/playback/cdp-utils'
describe('CDP Utils', () => {
  it('should build a frame tree from document tree', () => {
    const snapshot = require('./snapshot-1.json')
    const tree = buildFrameTree(snapshot)
    expect(tree.children[5].documentURL).toBe(
      '/Authentication/Authenticate?returnUrl=%2Fiframe_return.htm%3Fgoto%3Dhttps%253a%252f%252fapps.autodesk.com%253a443%252fBIM360%252fen%252fDetail%252fIndex%253fid%253d1459166100220459147%2526appLang%253den%2526os%253dWeb&isImmediate=false'
    )
    expect(tree.children[5].documentNodeId).toBe(2413)
  })
})
