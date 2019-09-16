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

import Route from './route'

export default class Router {
  constructor() {
    this.routes = []
    this.get = this._registerRoute.bind(this, 'get')
    this.post = this._registerRoute.bind(this, 'post')
    this.put = this._registerRoute.bind(this, 'put')
    this.patch = this._registerRoute.bind(this, 'patch')
    this.delete = this._registerRoute.bind(this, 'delete')
    this.all = this._registerRoute.bind(this, undefined)
    this.run = this.run.bind(this)
    this.use = this.use.bind(this)
  }
  _registerRoute(verb, uri, cb) {
    this.routes.push(new Route(verb, uri, cb))
  }
  _mount(prefix) {
    return this.routes.map(r => new Route(r.verb, prefix + r.uri, r.run))
  }
  run({ verb, uri, ...request }) {
    return new Promise((res, rej) => {
      const route = this.routes.find(r => r.test(verb, uri))
      route
        ? route.run(request.payload, res)
        : rej(new Error('No compliant route found'))
    })
  }
  use(prefix = '', router) {
    this.routes = [...this.routes, ...router._mount(prefix)]
  }
}
