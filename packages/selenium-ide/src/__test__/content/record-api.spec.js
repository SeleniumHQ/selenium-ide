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

// TODO:
// - Confirm event path in manual recording to confirm mirror in tests
// - Update package.json with jsdom config for jsDomError & virtualConsole
//     It errors on click of element in form (e.g., button.click();)
//     Something equivalent to this:
//       virtualConsole = new VirtualConsole();
//       virtualConsole.on("jsdomError", () => { });

jest.mock("../../content/closure-polyfill");
const recordApi = require("../../content/record-api");
recordApi.record = jest.fn();
import { resetHelperVariables } from "../../content/record";
import { fireEvent } from "dom-testing-library";

describe("record-api", () => {
  describe("setup", () => {
    it("window exists", () => {
      expect(window).toBeDefined();
    });

    it("window body is empty", () => {
      expect(window.document.body.outerHTML).toEqual("<body></body>");
    });

    it("event handlers exist", () => {
      expect(recordApi.Recorder.eventHandlers).not.toEqual({});
    });

    it("recorder attached with event handlers", async () => {
      const recorder = new recordApi.Recorder(window);
      await recorder.attach();
      expect(recorder.attached).toBeTruthy();
      expect(recorder.eventListeners).toBeTruthy();
      await recorder.detach();
      expect(recorder.attached).toBeFalsy();
    });
  });

  describe("form", () => {
    let recorder;
    let element;

    function render(markup) {
      element = window.document.createElement("div");
      element.id = "test-target";
      element.innerHTML = markup;
      window.document.body.appendChild(element);
    }

    beforeEach(() => {
      recorder = new recordApi.Recorder(window);
      recorder.attach();
    });

    afterEach(() => {
      if (recorder && recorder.attached) {
        recorder.detach();
        recorder = undefined;
      }
      if (element && element.id && element.id === "test-target") {
        element.parentElement.removeChild(element);
        element = undefined;
      }
      resetHelperVariables();
    });

    const enterKey = { key: "Enter", keyCode: 13 };

    function filter(source, matcher) {
      return source.find(
        function(target) {
          return target[0].match(matcher);
        }
      );
    }

    describe("enter keydown", () => {
      it("populated input records submit", () => {
        render(`
          <form id="blah">
            <input></br>
          </form>
        `);
        const target = window.document.querySelector("form input");
        fireEvent.input(target, { target: { value: "blah" } });
        fireEvent.keyDown(target, enterKey);
        expect(recordApi.record.mock.calls[1][0]).toEqual("submit");
      });

      it("unpopulated input records nothing", () => {
        render(`
          <form id="blah">
            <input></br>
          </form>
        `);
        const target = window.document.querySelector("form input");
        fireEvent.keyDown(target, enterKey);
        expect(recordApi.record.mock.calls).toEqual([]);
      });

      it("button without type=submit records click", () => {
        render(`
          <form id="blah">
            <input type="email"></br>
            <button type="button">Next</button>
            <button type="submit" style="display: none">Next</button>
          </form>
        `);
        const target = window.document.querySelector("form input");
        fireEvent.change(target, { target: { value: "blah" } });
        fireEvent.keyDown(target, enterKey);
        expect(recordApi.record.mock.calls[1][0]).toEqual("click");
        expect(
          filter(recordApi.record.mock.calls[1][1], "type=\"submit\"")
        ).toBeUndefined();
        expect(
          filter(recordApi.record.mock.calls[1][1], "type=\"button\"").length
        ).toBeGreaterThan(0);
      });

      it("button with type=submit records submit", () => {
        render(`
          <form id="blah">
            <input></br>
            <button type="submit">Next</button>
          </form>
        `);
        const target = window.document.querySelector("form input");
        fireEvent.input(target, { target: { value: "blah" } });
        fireEvent.keyDown(target, enterKey);
        expect(recordApi.record.mock.calls[1][0]).toEqual("submit");
      });
    });
  });
});
