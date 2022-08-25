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

import { ProxyCapabilities, ProxyInputOptions, ProxyType } from './types'

export default function ParseProxy(
  type: ProxyType,
  options?: ProxyInputOptions
): ProxyCapabilities {
  if (type === 'direct' || type === 'system') {
    return {
      proxyType: type,
    }
  } else if (type === 'pac') {
    if (!options || typeof options !== 'string') {
      throw new Error(
        'A proxy autoconfig URL was not passed (e.g. --proxy-options="http://localhost/pac")'
      )
    }
    return {
      proxyType: type,
      proxyAutoconfigUrl: options,
    }
  } else if (type === 'manual') {
    if (!options) {
      return {
        proxyType: type,
      }
    } else if (typeof options !== 'object') {
      throw new Error(
        'Proxy options were not passed to manual proxy (e.g. --proxy-options="http=localhost:321 ftp=localhost:4324")'
      )
    } else {
      let opts: Omit<ProxyCapabilities, 'proxyType'> = {}
      if (options.http) opts.httpProxy = options.http as string
      if (options.https) opts.sslProxy = options.https as string
      if (options.ftp) opts.ftpProxy = options.ftp as string
      if (options.bypass) opts.noProxy = options.bypass as string[]
      return {
        proxyType: type,
        ...opts,
      }
    }
  } else if (type === 'socks') {
    if (!options || typeof options === 'string' || !options.socksProxy) {
      throw new Error(
        'Proxy options were not passed to socks proxy (e.g. --proxy-options="socksProxy=localhost:321")'
      )
    } else {
      if (options.socksVersion) {
        const ver = parseInt(options.socksVersion as string)
        if (ver) {
          return {
            proxyType: 'manual',
            socksProxy: options.socksProxy as string,
            socksVersion: ver,
          }
        } else {
          throw new Error(
            'Proxy socks version is invalid (e.g. --proxy-options="socksProxy=localhost:321 socksVersion=5")'
          )
        }
      } else {
        return {
          proxyType: 'manual',
          socksProxy: options.socksProxy as string,
        }
      }
    }
  } else {
    throw new Error(
      'An unknown proxy type was passed, use one of: direct, system, manual, socks or pac (e.g. --proxy-type="direct")'
    )
  }
}
