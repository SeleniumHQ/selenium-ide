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

import { ProxyCapabilities } from '../types'
import ParseProxy from '../proxy'

describe('proxy parser', () => {
  it('should parse a direct proxy', () => {
    expect(ParseProxy('direct')).toEqual<ProxyCapabilities>({
      proxyType: 'direct',
    })
  })
  it('should parse a system proxy', () => {
    expect(ParseProxy('system')).toEqual<ProxyCapabilities>({
      proxyType: 'system',
    })
  })
  it('should parse a pac proxy', () => {
    expect(
      ParseProxy('pac', 'http://localhost/pac')
    ).toEqual<ProxyCapabilities>({
      proxyType: 'pac',
      proxyAutoconfigUrl: 'http://localhost/pac',
    })
  })
  it('should throw if no pac file was given', () => {
    expect(() => ParseProxy('pac')).toThrowError(
      'A proxy autoconfig URL was not passed (e.g. --proxy-options="http://localhost/pac")'
    )
  })
  it('should parse a manual proxy', () => {
    expect(ParseProxy('manual', {})).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
    })
  })
  it('should omit redundant keys from the proxy', () => {
    expect(
      ParseProxy('manual', { test: 4, http: 'http://localhost:4324' })
    ).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
      httpProxy: 'http://localhost:4324',
    })
  })
  it('should whitelist the allowed proxy protocols', () => {
    expect(
      ParseProxy('manual', {
        test: 4,
        http: 'http://localhost:4324',
        https: 'http://localhost:4324',
        ftp: 'http://localhost:4324',
        bypass: ['http://something.com'],
      })
    ).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
      httpProxy: 'http://localhost:4324',
      ftpProxy: 'http://localhost:4324',
      sslProxy: 'http://localhost:4324',
      noProxy: ['http://something.com'],
    })
  })
  it('should return an empty object if no options were given to manual proxy', () => {
    expect(ParseProxy('manual')).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
    })
  })
  it('should throw if non object was passed to manual proxy type', () => {
    // @ts-expect-error intentionally invalid type
    expect(() => ParseProxy('manual', 5)).toThrowError(
      'Proxy options were not passed to manual proxy (e.g. --proxy-options="http=localhost:321 ftp=localhost:4324")'
    )
  })
  it('should parse socks proxy', () => {
    expect(
      ParseProxy('socks', { socksProxy: 'localhost:213' })
    ).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
      socksProxy: 'localhost:213',
    })
  })
  it('should parse socks proxy version', () => {
    expect(
      ParseProxy('socks', { socksProxy: 'localhost:213', socksVersion: 5 })
    ).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
      socksProxy: 'localhost:213',
      socksVersion: 5,
    })
    expect(
      ParseProxy('socks', { socksProxy: 'localhost:213', socksVersion: '5' })
    ).toEqual<ProxyCapabilities>({
      proxyType: 'manual',
      socksProxy: 'localhost:213',
      socksVersion: 5,
    })
  })
  it('should throw if no socks proxy url was given', () => {
    expect(() => ParseProxy('socks')).toThrowError(
      'Proxy options were not passed to socks proxy (e.g. --proxy-options="socksProxy=localhost:321")'
    )
    expect(() => ParseProxy('socks', {})).toThrowError(
      'Proxy options were not passed to socks proxy (e.g. --proxy-options="socksProxy=localhost:321")'
    )
  })
  it('should throw if a non-number was passed as socks version', () => {
    expect(() =>
      ParseProxy('socks', { socksProxy: 'localhost:434', socksVersion: 'test' })
    ).toThrowError(
      'Proxy socks version is invalid (e.g. --proxy-options="socksProxy=localhost:321 socksVersion=5")'
    )
  })
  it('should throw if an invalid proxy type was passed', () => {
    // @ts-expect-error intentionally invalid type
    expect(() => ParseProxy('invalid')).toThrowError(
      'An unknown proxy type was passed, use one of: direct, system, manual, socks or pac (e.g. --proxy-type="direct")'
    )
  })
})
