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

export default class Argument<T> {
  readonly name: string
  readonly description: string
  readonly extending?: Argument<any>
  private _verify: verificationFunction<T>

  constructor(
    name: string,
    description: string,
    verify: verificationFunction<T>,
    extending?: Argument<any>
  ) {
    this.name = name
    this.description = description
    this._verify = verify
    this.extending = extending
  }

  verify(value: T): boolean {
    return this._verify(value)
  }

  extentionOf(argument: Argument<any>): boolean {
    return this.extending
      ? this.extending === argument || this.extending.extentionOf(argument)
      : false
  }
}

export type verificationFunction<T> = (value: T) => boolean
