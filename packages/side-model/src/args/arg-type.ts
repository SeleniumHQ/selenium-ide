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

import Argument from './argument'

export default class ArgType<T extends Argument<any, any>[]> {
  readonly args: T
  required = false

  constructor(args: T) {
    this.args = args
  }

  isRequired() {
    this.required = true

    return this
  }

  identify(value: ExtractArgument<T[number]>): T[number] {
    const result = this.args.find(arg => arg.identify(value))

    if (!result) {
      throw new TypeError(
        `Unexpected input received, expected${
          this.args.length !== 1 ? ' one of' : ''
        }${this.args.map(arg => ' ' + arg.name)}.`
      )
    }

    return result
  }

  validate(value?: ExtractArgument<T[number]>) {
    if (this.required && value === undefined) {
      throw new TypeError('Argument is required')
    }
    return (
      (!this.required && value === undefined) ||
      (value !== undefined && this.identify(value).validate(value))
    )
  }

  static exact<S extends Argument<any, any>>(arg: S) {
    return new ArgType([arg])
  }

  static oneOf<S extends Argument<any, any>[]>(args: S) {
    return new ArgType(args)
  }
}

export type ExtractArgument<A> = A extends Argument<infer B, any> ? B : never
