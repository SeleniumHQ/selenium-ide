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

export default class Argument<T, S extends Argument<any, any> = never> {
  readonly name: string
  readonly description: string
  readonly extending?: S
  readonly identify: validationFunction<T>
  readonly validate: validationFunction<T>

  constructor({
    name,
    description,
    identify,
    validate,
    extending,
  }: {
    name: string
    description: string
    identify: validationFunction<T>
    validate: validationFunction<T>
    extending?: S
  }) {
    this.name = name
    this.description = description
    this.identify = identify
    this.validate = validate
    this.extending = extending
  }

  is(arg: Argument<any, any>): arg is Argument<T, S> {
    return arg === this
  }

  extensionOf(argument: Argument<any, any>): boolean {
    return this.extending
      ? this.extending === argument || this.extending.extensionOf(argument)
      : false
  }
}

export type validationFunction<T> = (value: T) => boolean
