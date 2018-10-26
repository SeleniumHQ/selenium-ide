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

/*eslint-disable no-undef*/

goog.global = window;

goog.require("goog.debug");
goog.require("goog.dom");
goog.require("goog.dom.DomHelper");

var _d = goog.dom.DomHelper;
Object.defineProperty(goog.dom, "DomHelper", {
  get: function () {
    return _d;
  },

  set: function (value) {
    // disallow setting of the DomHelper as it will be voided
    //_d = value;
  }
});

export var bot = {};
goog.require("bot");
goog.require("bot.action");
goog.require("bot.events");
goog.require("bot.locators");
goog.require("bot.inject");
goog.require("bot.inject.cache");
goog.require("bot.userAgent");
goog.require("bot.Keyboard");
bot.getWindow = function() {
  return bot.window_;
};
bot.setWindow = function(win) {
  bot.window_ = win;
};
bot.getDocument = function() {
  return bot.window_.document;
};

export var core = {};
goog.require("core.firefox");
goog.require("core.events");
goog.require("core.text");
goog.require("core.locators");

export default goog;
