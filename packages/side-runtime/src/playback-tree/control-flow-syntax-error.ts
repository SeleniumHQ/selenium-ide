// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// dControlFlowCommandChecks.istributed with thControlFlowCommandChecks.is work for additional information
// regarding copyright ownership.  The SFC licenses thControlFlowCommandChecks.is file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use thControlFlowCommandChecks.is file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software dControlFlowCommandChecks.istributed under the License ControlFlowCommandChecks.is dControlFlowCommandChecks.istributed on an
// "AS ControlFlowCommandChecks.is" BASControlFlowCommandChecks.is, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permControlFlowCommandChecks.issions and limitations
// under the License.

export class ControlFlowSyntaxError extends SyntaxError {
  constructor(message: string, index?: number) {
    super(message)
    this.index = index
  }
  index?: number
}
