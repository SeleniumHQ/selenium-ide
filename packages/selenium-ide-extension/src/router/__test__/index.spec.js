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

import Router from '../index'

describe('string router', () => {
  it('should support get verb', () => {
    const router = new Router()
    router.get('/', (_req, res) => {
      res(true)
    })
    return expect(
      router.run({
        verb: 'get',
        uri: '/',
      })
    ).resolves.toBeTruthy()
  })
  it('should support put verb', () => {
    const router = new Router()
    router.put('/', (_req, res) => {
      res(true)
    })
    return expect(
      router.run({
        verb: 'put',
        uri: '/',
      })
    ).resolves.toBeTruthy()
  })
  it('should support patch verb', () => {
    const router = new Router()
    router.patch('/', (_req, res) => {
      res(true)
    })
    return expect(
      router.run({
        verb: 'patch',
        uri: '/',
      })
    ).resolves.toBeTruthy()
  })
  it('should support post verb', () => {
    const router = new Router()
    router.post('/', (_req, res) => {
      res(true)
    })
    return expect(
      router.run({
        verb: 'post',
        uri: '/',
      })
    ).resolves.toBeTruthy()
  })
  it('should support delete verb', () => {
    const router = new Router()
    router.delete('/', (_req, res) => {
      res(true)
    })
    return expect(
      router.run({
        verb: 'delete',
        uri: '/',
      })
    ).resolves.toBeTruthy()
  })
  it('should support any verb', () => {
    const router = new Router()
    router.all('/', (_req, res) => {
      res(true)
    })
    return expect(
      router.run({
        uri: '/',
      })
    ).resolves.toBeTruthy()
  })
  it('should handle verbs case insensitive', () => {
    const router = new Router()
    router.get('/', (_req, res) => {
      res(true)
    })
    return Promise.all([
      expect(
        router.run({
          verb: 'GET',
          uri: '/',
        })
      ).resolves.toBeTruthy(),
      expect(
        router.run({
          verb: 'get',
          uri: '/',
        })
      ).resolves.toBeTruthy(),
      expect(
        router.run({
          verb: 'GeT',
          uri: '/',
        })
      ).resolves.toBeTruthy(),
    ])
  })
  it('should mount another router', () => {
    const root = new Router()
    const mounted = new Router()
    mounted.get('/people', (_req, res) => {
      res(true)
    })
    root.use('/v1', mounted)
    return expect(
      root.run({
        verb: 'get',
        uri: '/v1/people',
      })
    ).resolves.toBeTruthy()
  })
  it('should mount on root route', () => {
    const root = new Router()
    const mounted = new Router()
    mounted.get('/people', (_req, res) => {
      res(true)
    })
    root.use(undefined, mounted)
    return expect(
      root.run({
        verb: 'get',
        uri: '/people',
      })
    ).resolves.toBeTruthy()
  })
})
