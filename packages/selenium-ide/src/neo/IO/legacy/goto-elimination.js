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

export function transformToConditional(goto) {
  return ([
    {
      command: "if",
      target: goto.command === "gotoIf" ? goto.target : "true"
    },
    {
      command: "goto",
      target: goto.command === "gotoIf" ? goto.value : goto.target
    },
    {
      command: "end"
    }
  ]);
}

export function eliminateLabel(procedure, label) {
  return procedure.filter(p => p !== label);
}

export function eliminateGoto(procedure, goto, label) {
  // only for siblings
  const p = [...procedure];
  const gotoIndex = procedure.indexOf(goto), labelIndex = procedure.indexOf(label);
  if (gotoIndex < labelIndex) {
    // eliminate using conditional
    const ifIndex = gotoIndex - 1;
    p[ifIndex] = Object.assign({...p[ifIndex]}, {target: `!${p[ifIndex].target}`});
    p.splice(labelIndex, 0, { command: "end" });
    p.splice(gotoIndex, 2);
  } else {
    // eliminate using do while
    const ifIndex = gotoIndex - 1;
    p.splice(ifIndex, 3, { command: "endDo", target: p[ifIndex].target });
    p.splice(labelIndex, 0, { command: "do" });
  }
  return p;
}

function isConditionalGoto(procedure, goto) {
  const index = procedure.indexOf(goto);
  return (procedure[index - 1].command === "if" && procedure[index + 1] === "end");
}
