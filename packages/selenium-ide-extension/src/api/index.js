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

import Router from '../router'
import apiv1 from './v1'

const router = new Router()
router.use('/v1', apiv1)
router.use(undefined, apiv1)

export default function(message, _backgroundPage, sendResponse) {
  // The sender is always the background page since he is the one listening to the event
  // message.id is the external extension id
  if (message.uri) {
    router
      .run(message)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true
  }
}
