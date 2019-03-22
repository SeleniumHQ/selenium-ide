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

import { action, observable } from 'mobx'
import Log, { LogTypes } from '../../ui-models/Log'

class Output {
  @observable
  logs = []

  @action.bound
  log(log) {
    this.logs.push(log)
  }

  @action.bound
  clear() {
    this.logs.clear()
  }

  print(std) {
    if (!std) {
      return this.logs.join('\r\n')
    } else if (std === 1) {
      return this.logs
        .filter(log => log.status === LogTypes.Success)
        .join('\r\n')
    } else if (std === 2) {
      return this.logs
        .filter(log => log.status !== LogTypes.Success)
        .join('\r\n')
    } else {
      throw new Error('No such standard')
    }
  }
}

export const output = new Output()

export class Logger {
  constructor(channel = Channels.SYSTEM) {
    this.channel = channel

    this.log = this.log.bind(this, this.channel)
    this.warn = this.warn.bind(this)
    this.error = this.error.bind(this)
  }

  log(channel, log) {
    if (typeof log === 'string') {
      log = new Log(log)
    }
    log.setChannel(channel)
    output.log(log)

    return log
  }

  warn(log) {
    const warnLog = this.log(typeof log === 'string' ? `Warning ${log}` : log)
    warnLog.setStatus(LogTypes.Warning)
  }

  error(log) {
    const errorLog = this.log(log)
    errorLog.setStatus(LogTypes.Error)
  }

  get(channel) {
    return new Logger(channel)
  }

  clearLogs() {
    output.clear()
  }

  printLogs(std) {
    return output.print(std)
  }
}

export const Channels = {
  PLAYBACK: 'playback',
  SYSTEM: 'sys',
}

if (!window._logger) {
  window._logger = new Logger()
}
export default window._logger
