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

import Region from '../../models/Region'

describe('Region', () => {
  it('should have x, y, width and height', () => {
    const region = new Region('x: 293, y: 621, width: 315, height: 492')
    expect(region.isValid()).toBeTruthy()
  })
  it('should verify a valid region', () => {
    const region = new Region('x: 293, y: 621, width: 315, height: 492')
    expect(region.isValid()).toBeTruthy()
  })
  it('should fail to verify a region with no width', () => {
    const region = new Region('x: 293, y: 621, height: 492')
    expect(region.isValid()).toBeFalsy()
  })
  it('should be valid for 0', () => {
    const region = new Region('x: 0, y: 621, width: 123, height: 492')
    expect(region.isValid()).toBeTruthy()
  })
})
