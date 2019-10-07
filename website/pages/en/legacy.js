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

// eslint-disable-next-line
const React = require('react')

// eslint-disable-next-line node/no-missing-require
const CompLibrary = require('../../core/CompLibrary.js')

const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

function Legacy() {
  const supportLinks = [
    {
      content: `Before downloading please be aware of a few things.\n\n- The legacy IDE is no longer maintained, bugs found in it will **not** be fixed.\n\n- Firefox versions that can run the legacy IDE are no longer supported, which makes them vulnerable to security and compatibility issues.`,
      title: 'Download',
    },
  ]

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>Legacy Selenium IDE</h1>
          </header>
          <p>
            The legacy version of Selenium IDE is no longer maintained, no bugs
            found in it will be fixed. Issues opened about it will be closed.
          </p>
          <GridBlock contents={supportLinks} layout="threeColumn" />
          <a href="/selenium-ide/download/selenium_ide-2.9.1-fx.xpi" download>
            Download anyway
          </a>
        </div>
      </Container>
    </div>
  )
}

module.exports = Legacy
