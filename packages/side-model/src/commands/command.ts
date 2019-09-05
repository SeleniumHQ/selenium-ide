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

import ArgType, { ExtractArgument } from '../args/arg-type'
import Argument from '../args/argument'

export default class Command<T extends CommandArguments> {
  readonly name: string
  readonly description: string
  readonly args: T
  readonly validate: CommandValidationFunction<T>

  constructor({
    name,
    description,
    validate,
    args,
  }: {
    name: string
    description: string
    validate: CommandValidationFunction<T>
    args: T
  }) {
    this.name = name
    this.description = description
    this.args = args
    this.validate = validate
  }
}

interface CommandArguments {
  [key: string]: ArgType<Argument<any, any>[]>
}

type ExtractArgType<A> = A extends ArgType<infer B>
  ? ExtractArgument<B[number]> | undefined
  : never
type ExtractArgumentFromArgType<A extends CommandArguments> = {
  [K in keyof A]: ExtractArgType<A[K]>
}
type CommandValidationFunction<A extends CommandArguments> = (
  value: ExtractArgumentFromArgType<A>
) => boolean
