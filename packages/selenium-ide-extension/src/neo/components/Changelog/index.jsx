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

import React from 'react'
import ModalState from '../../stores/view/ModalState.js'
import storage from '../../IO/storage'
import changelog from '../../../../Changelog.md'
import project from '../../../../package.json'

export default class Changelog extends React.Component {
  constructor(props) {
    super(props)
    storage.get('updated').then(data => {
      if (data.updated) {
        // TODO: menu entry-indication
        storage.set({
          updated: false,
        })
      }
    })
  }

  render() {
    return null
  }
}

export function showChangelog() {
  ModalState.showAlert({
    title: `What's new: ${project.version}`,
    description: changelog,
    isMarkdown: true,
  })
}
