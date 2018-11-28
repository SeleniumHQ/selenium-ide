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

export default function ParseProxy(type, options) {
  if (type === 'direct' || type === 'system') {
    return {
      proxyType: type,
    }
  } else if (type === 'pac') {
    if (!options) {
      throw new Error(
        'A proxy autoconfig URL was not passed (e.g. --proxy-options="http://localhost/pac")'
      )
    }
    return {
      proxyType: type,
      proxyOptions: options,
    }
  } else if (type === 'manual') {
    if (!options) {
      return {
        proxyType: type,
        proxyOptions: {},
      }
    } else if (typeof options !== 'object') {
      throw new Error(
        'Proxy options were not passed to manual proxy (e.g. --proxy-options="http=localhost:321 ftp=localhost:4324")'
      )
    } else {
      let opts = {}
      if (options.http) opts.http = options.http
      if (options.https) opts.https = options.https
      if (options.ftp) opts.ftp = options.ftp
      if (options.bypass) opts.bypass = options.bypass
      return {
        proxyType: type,
        proxyOptions: opts,
      }
    }
  } else if (type === 'socks') {
    if (!options || !options.socksProxy) {
      throw new Error(
        'Proxy options were not passed to socks proxy (e.g. --proxy-options="socksProxy=localhost:321")'
      )
    } else {
      if (options.socksVersion) {
        const ver = parseInt(options.socksVersion)
        if (ver) {
          return {
            proxyType: type,
            proxyOptions: {
              socksProxy: options.socksProxy,
              socksVersion: ver,
            },
          }
        } else {
          throw new Error(
            'Proxy socks version is invalid (e.g. --proxy-options="socksProxy=localhost:321 socksVersion=5")'
          )
        }
      } else {
        return {
          proxyType: type,
          proxyOptions: {
            socksProxy: options.socksProxy,
          },
        }
      }
    }
  } else {
    throw new Error(
      'An unknown proxy type was passed, use one of: direct, system, manual, socks or pac (e.g. --proxy-type="direct")'
    )
  }
}
