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

import { calculateFrameIndex } from "../../content/utils";

describe("utils", () => {
  describe("calculate frame index", () => {
    it("when recording indicator index is undefined", () => {
      expect(calculateFrameIndex(undefined, 0)).toEqual(0);
      expect(calculateFrameIndex(undefined, 1)).toEqual(1);
      expect(calculateFrameIndex(undefined, 2)).toEqual(2);
    });
    it("when recording indicator index is < 0", () => {
      expect(calculateFrameIndex(-1, 0)).toEqual(0);
      expect(calculateFrameIndex(-2, 1)).toEqual(1);
      expect(calculateFrameIndex(-10, 2)).toEqual(2);
    });
    it("when recording indicator index is 0", () => {
      expect(calculateFrameIndex(0, 1)).toEqual(0);
      expect(calculateFrameIndex(0, 2)).toEqual(1);
      expect(calculateFrameIndex(0, 3)).toEqual(2);
    });
    it("when recording indicator index is 1", () => {
      expect(calculateFrameIndex(1, 0)).toEqual(0);
      expect(calculateFrameIndex(1, 2)).toEqual(1);
      expect(calculateFrameIndex(1, 3)).toEqual(2);
    });
    it("when recording indicator index is 2", () => {
      expect(calculateFrameIndex(2, 0)).toEqual(0);
      expect(calculateFrameIndex(2, 1)).toEqual(1);
      expect(calculateFrameIndex(2, 3)).toEqual(2);
    });
    it("when recording indicator index is 4", () => {
      expect(calculateFrameIndex(4, 7)).toEqual(6);
    });
  });
});
