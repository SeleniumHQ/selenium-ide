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

jest.mock('../../../content/closure-polyfill')
jest.mock('../../IO/storage')
jest.mock('../../stores/view/UiState')
import ProjectStore from '../../stores/domain/ProjectStore'
import { loadProject, loadAsText } from '../../IO/filesystem'

describe('filesystem', () => {
  const fileJson = {
    tests: [
      {
        id: '',
        name: 'new test case',
        commands: [
          {
            id: '',
            comment: '',
            command: 'click',
            target: 'css=.modal.fade.in .btn-primary',
            targets: [],
            value: '',
          },
        ],
      },
    ],
    suites: [],
    urls: ['http://localhost:8080/'],
    url: 'http://localhost:8080',
    name: 'My New Test',
    id: '5d710d77-2d3d-4eb9-a3a4-7d6269371f3e',
    version: '2.0',
  }
  let project
  let fileString
  let sideFile
  let sideFileWithUppercaseExtension
  let event

  beforeEach(() => {
    project = new ProjectStore('seed project')
    fileString = JSON.stringify(fileJson)
    sideFile = new File([new Blob([fileString])], 'my-new-test.side', {
      size: fileString.length,
      lastModified: Date.now(),
      lastModifiedDate: new Date(),
    })
    sideFileWithUppercaseExtension = new File(
      [new Blob([fileString])],
      'my-new-test.SIDE',
      {
        size: fileString.length,
        lastModified: Date.now(),
        lastModifiedDate: new Date(),
      }
    )
    event = { target: { files: [sideFile] } }
  })

  it('should load file as text ', async () => {
    const contents = await loadAsText(event.target.files[0])
    expect(contents).toEqual(JSON.stringify(fileJson))
  })

  describe('loadProject', () => {
    it('should load project with lowercase file extension', async () => {
      await loadProject(project, event.target.files[0])
      expect(project.id).toEqual(fileJson.id)
    })

    it('should load project with uppercase file extension', async () => {
      event.target.files = [sideFileWithUppercaseExtension]
      await loadProject(project, event.target.files[0])
      expect(project.id).toEqual(fileJson.id)
    })
  })
})
