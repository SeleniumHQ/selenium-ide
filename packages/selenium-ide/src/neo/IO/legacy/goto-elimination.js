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

export function transformOutward(procedure, goto) {
  const block = findEnclosingBlock(procedure, goto);
  const end = findBlockClose(procedure, block);
  const p = [...procedure];
  if (block.command !== "if") {
    // outward loop movement
    transformOutwardLoop(p, goto, block, end);
  } else {
    // outward conditional movement
    transformOutwardConditional(p, goto, block, end);
  }
  return p;
}

function transformOutwardLoop(p, goto, block, end) {
  const ifIndex = p.indexOf(goto) - 1;
  p.splice(ifIndex, 3,
    { command: "storeValue", target: p[ifIndex].target, value: goto.target },
    { command: "if", target: `\${${goto.target}}` },
    { command: "break" },
    { command: "end" }
  );
  const endIndex = p.indexOf(end);
  p.splice(endIndex + 1, 0,
    { command: "if", target: `\${${goto.target}}` },
    { command: "goto", target: goto.target },
    { command: "end" }
  );
}

function transformOutwardConditional(p, goto, block, end) {
  const ifIndex = p.indexOf(goto) - 1;
  p.splice(ifIndex, 3,
    { command: "storeValue", target: p[ifIndex].target, value: goto.target },
    { command: "if", target: `!\${${goto.target}}` }
  );
  const endIndex = p.indexOf(end);
  p.splice(endIndex + 1, 0,
    { command: "end" },
    { command: "if", target: `\${${goto.target}}` },
    { command: "goto", target: goto.target },
    { command: "end" }
  );
}

export function transformInward(procedure, goto) {
}

export function lift(procedure, goto, label) {
  const p = [
    { command: "storeValue", target: "false", value: goto.target },
    ...procedure
  ];
  const labelIndex = p.indexOf(label);
  p.splice(labelIndex, 0,
    {
      command: "do"
    },
    {
      command: "if",
      target: `\${${goto.target}}`
    },
    {
      command: "goto",
      target: goto.target
    },
    {
      command: "end"
    }
  );
  const ifIndex = p.indexOf(goto) - 1;
  p.splice(ifIndex, 3,
    {
      command: "storeValue",
      target: "condition",
      value: goto.target
    },
    {
      command: "endDo",
      target: `\${${goto.target}}`
    }
  );
  return p;
}

function findEnclosingBlock(procedure, goto) {
  // remember to skip the enclosing if
  for (let i = procedure.indexOf(goto) - 2; i >= 0; i--) {
    if (isBlock(procedure[i])) return procedure[i];
  }
}

function findBlockClose(procedure, block) {
  let level = 1, index = procedure.indexOf(block);
  while (level !== 0) {
    index++;
    if (isBlock(procedure[index])) {
      level++;
    } else if (isBlockEnd(procedure[index])) {
      level--;
    }
  }
  return procedure[index];
}

function isBlock(statement) {
  switch(statement.command) {
    case "if":
    case "do":
    case "while":
      return true;
    default:
      return false;
  }
}

function isBlockEnd(statement) {
  switch(statement.command) {
    case "end":
    case "endDo":
      return true;
    default:
      return false;
  }
}

function isConditionalGoto(procedure, goto) {
  const index = procedure.indexOf(goto);
  return (procedure[index - 1].command === "if" && procedure[index + 1] === "end");
}
