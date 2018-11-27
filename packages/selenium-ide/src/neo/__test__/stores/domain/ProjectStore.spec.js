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

import { useStrict } from 'mobx'
import ProjectStore from '../../../stores/domain/ProjectStore'
import Suite from '../../../models/Suite'
import TestCase from '../../../models/TestCase'

useStrict(true)

describe('Project Store', () => {
  it('should have an id', () => {
    const store = new ProjectStore()
    expect(store.id).toBeDefined()
  })
  it('should have a name', () => {
    const store = new ProjectStore('myStore')
    expect(store.name).toBe('myStore')
  })
  it('should set a default name', () => {
    const store = new ProjectStore()
    expect(store.name).toBe('Untitled Project')
  })
  it('should set the name', () => {
    const store = new ProjectStore('test')
    store.changeName('changed')
    expect(store.name).toBe('changed')
  })
  it('should remove illegal characters from the project name', () => {
    const store = new ProjectStore('test')
    store.changeName('te&nbsp;<br>st<br>')
    expect(store.name).toBe('te&nbsp;st')
  })
  it('should have a base url', () => {
    const store = new ProjectStore()
    expect(store).toHaveProperty('url')
  })
  it('should set the url', () => {
    const store = new ProjectStore()
    const url = 'http://www.seleniumhq.org/'
    store.setUrl(url)
    expect(store.url).toBe(url)
  })
  it('should contain list of previous base urls', () => {
    const store = new ProjectStore()
    expect(store.urls).toBeDefined()
  })
  it('should add to the list of previous used base urls', () => {
    const store = new ProjectStore()
    const url = 'http://www.seleniumhq.org/'
    store.addUrl(url)
    expect(store.urls.length).toBe(1)
  })
  it('should not attempt to add a URL if undefined', () => {
    const store = new ProjectStore()
    store.addUrl(undefined)
    expect(store.urls.length).toBe(0)
  })
  it('should not add duplicates to the url list', () => {
    const store = new ProjectStore()
    const url = new URL('http://www.seleniumhq.org/').href
    store.addUrl(url)
    store.addUrl(url)
    expect(store.urls.length).toBe(1)
  })
  it('should add the current url to the cache', () => {
    const store = new ProjectStore()
    store.setUrl('http://www.seleniumhq.org/')
    expect(store.urls.length).toBe(0)
    store.addCurrentUrl()
    expect(store.urls.length).toBe(1)
  })
  it('should verify the current url is valid', () => {
    const store = new ProjectStore()
    expect(() => {
      store.addUrl('test is not valid url')
    }).toThrowError('Invalid URL')
  })
  it('should add a new TestCase', () => {
    const store = new ProjectStore()
    expect(store.tests.length).toBe(0)
    store.addTestCase(new TestCase())
    expect(store.tests.length).toBe(1)
  })
  it('should throw if no TestCase was given', () => {
    const store = new ProjectStore()
    expect(() => store.addTestCase()).toThrowError(
      'Expected to receive TestCase instead received undefined'
    )
  })
  it('should throw if a different type was given', () => {
    const store = new ProjectStore()
    expect(() => store.addTestCase(1)).toThrowError(
      'Expected to receive TestCase instead received Number'
    )
  })
  it('should delete a test case', () => {
    const store = new ProjectStore()
    const test = new TestCase()
    store.addTestCase(test)
    expect(store.tests.length).toBe(1)
    store.deleteTestCase(test)
    expect(store.tests.length).toBe(0)
  })
  it('should create a test case', () => {
    const store = new ProjectStore()
    expect(store.tests.length).toBe(0)
    store.createTestCase()
    expect(store.tests.length).toBe(1)
  })
  it('should pass ctor args to test when created', () => {
    const store = new ProjectStore()
    const test = store.createTestCase('my test')
    expect(test.name).toBe('my test')
  })
  it('should rename a test with a name that already exists', () => {
    const store = new ProjectStore()
    store.createTestCase('my test')
    const test2 = store.createTestCase('my test')
    expect(test2.name).toBe('my test (1)')
  })
  it('should duplicate a test case', () => {
    const store = new ProjectStore()
    const test = store.createTestCase('first test')
    test.createCommand(undefined, 'open', '/')
    store.duplicateTestCase(test)
    const test2 = store.tests[1]
    expect(store.tests.length).toBe(2)
    expect(test).not.toBe(test2)
    expect(test.id).not.toEqual(test2.id)
    expect(test2.name).toBe('first test (1)')
    expect(test.commands[0].id).not.toEqual(test2.commands[0].id)
  })
  it('should create a suite', () => {
    const store = new ProjectStore()
    expect(store.suites.length).toBe(0)
    store.createSuite()
    expect(store.suites.length).toBe(1)
  })
  it('should pass ctor args to suite when created', () => {
    const store = new ProjectStore()
    const suite = store.createSuite('my suite')
    expect(suite.name).toBe('my suite')
  })
  it('should delete a suite', () => {
    const store = new ProjectStore()
    const control = store.createSuite('control')
    const toBeDeleted = store.createSuite('deleted')
    expect(store.suites.length).toBe(2)
    store.deleteSuite(toBeDeleted)
    expect(store.suites.length).toBe(1)
    expect(store.suites[0]).toBe(control)
  })
  it("should remove the deleted test from it's suites", () => {
    const store = new ProjectStore()
    const firstSuite = store.createSuite()
    const secondSuite = store.createSuite()
    const controlSuite = store.createSuite()
    const toBeDeleted = store.createTestCase()
    const control = store.createTestCase()
    firstSuite.addTestCase(toBeDeleted)
    secondSuite.addTestCase(toBeDeleted)
    secondSuite.addTestCase(control)
    controlSuite.addTestCase(control)
    expect(firstSuite.tests.length).toBe(1)
    expect(secondSuite.tests.length).toBe(2)
    expect(controlSuite.tests.length).toBe(1)
    store.deleteTestCase(toBeDeleted)
    expect(firstSuite.tests.length).toBe(0)
    expect(secondSuite.tests.length).toBe(1)
    expect(controlSuite.tests.length).toBe(1)
  })
  it('should load from JS', () => {
    const projectRep = {
      id: '1',
      name: 'my project',
      url: 'https://en.wikipedia.org/',
      tests: [
        {
          id: '1',
          name: 'testcase',
          commands: [],
        },
        {
          id: '2',
          name: 'first test',
          commands: [],
        },
        {
          id: '3',
          name: 'second test',
          commands: [],
        },
        {
          id: '4',
          name: 'third test',
          commands: [],
        },
      ],
      suites: [
        {
          id: '1',
          name: 'test suite',
          tests: ['2', '3'],
        },
        {
          id: '2',
          name: 'second suite',
          tests: ['1', '2', '4'],
        },
      ],
      urls: ['https://en.wikipedia.org/', 'http://www.seleniumhq.org/'].sort(),
      plugins: [
        {
          id: '1',
          name: 'Some plugin',
          version: '1.0.0',
        },
      ],
    }

    const project = new ProjectStore()
    project.fromJS(projectRep)
    expect(project.id).toBe(projectRep.id)
    expect(project.name).toBe(projectRep.name)
    expect(project.url).toBe(projectRep.url)
    expect(project.tests.length).toBe(4)
    expect(project.tests[0] instanceof TestCase).toBeTruthy()
    expect(project.suites.length).toBe(2)
    expect(project.suites[0] instanceof Suite).toBeTruthy()
    expect(project.urls.length).toBe(2)
    expect(project.urls[0]).toBe(projectRep.urls[0])
    expect(project.plugins.length).toBe(1)
    expect(project.plugins[0]).toEqual(projectRep.plugins[0])
  })
  it('should generate an ID for loaded project if none provided', () => {
    const projectRep = {
      name: 'my project',
      url: '',
      tests: [],
      suites: [],
      urls: [],
    }

    const project = new ProjectStore()
    project.fromJS(projectRep)
    expect(project.id).toBeDefined()
  })
  it('should remove duplicate urls when loaded', () => {
    const projectRep = {
      name: 'my project',
      url: '',
      tests: [],
      suites: [],
      urls: ['https://seleniumhq.org/', 'https://seleniumhq.org/'],
    }

    const project = new ProjectStore()
    project.fromJS(projectRep)
    expect(project.urls.length).toBe(1)
  })
  it('should have a list of loaded plugins', () => {
    const project = new ProjectStore()
    expect(project.plugins).toBeDefined()
  })
  it('should add to the list of loaded plugins', () => {
    const project = new ProjectStore()
    const plugin = {
      id: '1',
      name: 'Some plugin',
      version: '1.0.0',
    }
    project.registerPlugin(plugin)
    expect(project.plugins[0].id).toBe(plugin.id)
  })
  it('should upgrade the given plugin when upgraded', () => {
    const project = new ProjectStore()
    const plugin = {
      id: '1',
      name: 'to be upgraded',
      version: '1.0.0',
    }
    project.registerPlugin(plugin)
    const upgraded = {
      id: '1',
      name: 'was just upgraded',
      version: '2.0.0',
    }
    project.registerPlugin(upgraded)
    expect(project.plugins.length).toBe(1)
    expect(project.plugins[0].version).toEqual('2.0.0')
  })
})
