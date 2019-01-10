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

import { action, observable, computed } from 'mobx'
import uuidv4 from 'uuid/v4'

export default class Log {
  id = uuidv4()
  @observable
  index = null
  @observable
  commandId = null
  @observable
  message = null
  @observable
  description = null
  @observable
  status = null
  @observable
  channel = null
  @observable
  isNotice = false

  constructor(message, status) {
    this.message = message
    this.status = status
  }

  @action.bound
  setIndex(index) {
    this.index = index
  }

  @action.bound
  setCommandId(commandId) {
    this.commandId = commandId
  }

  @action.bound
  setMessage(message) {
    this.message = message
  }

  @action.bound
  setDescription(desc) {
    this.description = desc
  }

  @action.bound
  setStatus(status) {
    this.status = status
  }

  @action.bound
  setChannel(channel) {
    this.channel = channel
  }

  @action.bound
  setNotice() {
    this.isNotice = true
  }

  @action.bound
  isEqual(otherLog) {
    return (
      this.message === otherLog.message && this.commandId === otherLog.commandId
    )
  }

  @computed
  get _str() {
    return `${this.index ? this.index + '. ' : ''}${this.message}${
      this.description ? '\n\r  ' + this.description : ''
    }`
  }

  toString() {
    return this._str
  }
}

export const LogTypes = {
  Running: 'running',
  Success: 'success',
  Warning: 'warn',
  Error: 'error',
  Failure: 'failure',
  Undetermined: 'undetermined',
  Awaiting: 'awaiting',
}
