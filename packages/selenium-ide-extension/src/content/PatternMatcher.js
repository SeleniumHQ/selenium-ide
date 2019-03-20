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

import SeleniumError from './SeleniumError'

export default function PatternMatcher(pattern) {
  this.selectStrategy(pattern)
}

PatternMatcher.prototype = {
  selectStrategy: function(pattern) {
    this.pattern = pattern
    let strategyName = 'glob'
    // by default
    if (/^([a-z-]+):(.*)/.test(pattern)) {
      const possibleNewStrategyName = RegExp.$1
      const possibleNewPattern = RegExp.$2
      if (PatternMatcher.strategies[possibleNewStrategyName]) {
        strategyName = possibleNewStrategyName
        pattern = possibleNewPattern
      }
    }
    const matchStrategy = PatternMatcher.strategies[strategyName]
    if (!matchStrategy) {
      throw new SeleniumError(
        'cannot find PatternMatcher.strategies.' + strategyName
      )
    }
    this.strategy = matchStrategy
    this.matcher = new matchStrategy(pattern)
  },

  matches: function(actual) {
    return this.matcher.matches(actual + '')
    // Note: appending an empty string avoids a Konqueror bug
  },
}

/**
 * A "static" convenience method for easy matching
 */
PatternMatcher.matches = function(pattern, actual) {
  return new PatternMatcher(pattern).matches(actual)
}

PatternMatcher.strategies = {
  /**
   * Exact matching, e.g. "exact:***"
   */
  exact: function(expected) {
    this.expected = expected
    this.matches = function(actual) {
      return actual == this.expected
    }
  },

  /**
   * Match by regular expression, e.g. "regexp:^[0-9]+$"
   */
  regexp: function(regexpString) {
    this.regexp = new RegExp(regexpString)
    this.matches = function(actual) {
      return this.regexp.test(actual)
    }
  },

  regex: function(regexpString) {
    this.regexp = new RegExp(regexpString)
    this.matches = function(actual) {
      return this.regexp.test(actual)
    }
  },

  regexpi: function(regexpString) {
    this.regexp = new RegExp(regexpString, 'i')
    this.matches = function(actual) {
      return this.regexp.test(actual)
    }
  },

  regexi: function(regexpString) {
    this.regexp = new RegExp(regexpString, 'i')
    this.matches = function(actual) {
      return this.regexp.test(actual)
    }
  },

  /**
   * "globContains" (aka "wildmat") patterns, e.g. "glob:one,two,*",
   * but don't require a perfect match; instead succeed if actual
   * contains something that matches globString.
   * Making this distinction is motivated by a bug in IE6 which
   * leads to the browser hanging if we implement *TextPresent tests
   * by just matching against a regular expression beginning and
   * ending with ".*".  The globcontains strategy allows us to satisfy
   * the functional needs of the *TextPresent ops more efficiently
   * and so avoid running into this IE6 freeze.
   */
  globContains: function(globString) {
    this.regexp = new RegExp(PatternMatcher.regexpFromGlobContains(globString))
    this.matches = function(actual) {
      return this.regexp.test(actual)
    }
  },

  /**
   * "glob" (aka "wildmat") patterns, e.g. "glob:one,two,*"
   */
  glob: function(globString) {
    this.regexp = new RegExp(PatternMatcher.regexpFromGlob(globString))
    this.matches = function(actual) {
      return this.regexp.test(actual)
    }
  },
}

PatternMatcher.convertGlobMetaCharsToRegexpMetaChars = function(glob) {
  let re = glob
  re = re.replace(/([.^$+(){}\[\]\\|])/g, '\\$1') // eslint-disable-line no-useless-escape
  re = re.replace(/\?/g, '(.|[\r\n])')
  re = re.replace(/\*/g, '(.|[\r\n])*')
  return re
}

PatternMatcher.regexpFromGlobContains = function(globContains) {
  return PatternMatcher.convertGlobMetaCharsToRegexpMetaChars(globContains)
}

PatternMatcher.regexpFromGlob = function(glob) {
  return '^' + PatternMatcher.convertGlobMetaCharsToRegexpMetaChars(glob) + '$'
}
