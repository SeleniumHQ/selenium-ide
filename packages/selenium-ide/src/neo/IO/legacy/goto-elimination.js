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

// GENENRAL NOTE: procedure is non-mutable while p is
// Do not mutate statements, create new references
// Don't break goto references, you do not need to change them anyway (just their location)
export function eliminate(procedure) {
  let p = [...procedure];

  // Change all gotos to conditionals
  const unconditionalGotos = p.filter(statement => (statement.command === "goto" || statement.command === "gotoIf"));
  unconditionalGotos.forEach(goto => {
    const index = p.indexOf(goto);
    p.splice(index, 1, ...transformToConditional(goto));
  });

  const labels = p.filter(statement => statement.command === "label");
  const gotos = p.filter(statement => statement.command === "goto");

  // start eliminating
  while (gotos.length) {
    const goto = gotos[0];
    const label = findMatchingLabel(labels, goto);

    const relationship = relation(p, goto, label);
    if (relationship === Relationship.IndirectlyRelated) {
      // Make goto and label directly related
      // Ignoring switch and else statements
      p = transformOutward(p, goto);
    } else if (relationship === Relationship.DirectlyRelated) {
      // Make goto and label siblings
      if (calculateLevel(p, goto) > calculateLevel(p, label)) {
        p = transformOutward(p, goto);
      } else {
        if (p.indexOf(goto) > p.indexOf(label)) {
          p = lift(p, goto, label);
        }
        // Inward transformation
        p = transformInward(p, goto, label);
      }
    } else {
      // goto and label are siblings

      // eliminate goto
      p = eliminateGoto(p, goto, label);
      // remove it from the list of gotos
      gotos.shift();
    }
  }

  return p;
}

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
    { command: "store", target: p[ifIndex].target, value: goto.target },
    { command: "if", target: `\${${goto.target}}` },
    { command: "break" },
    { command: "end" }
  );
  const endIndex = p.indexOf(end);
  p.splice(endIndex + 1, 0,
    { command: "if", target: `\${${goto.target}}` },
    goto,
    { command: "end" }
  );
}

function transformOutwardConditional(p, goto, block, end) {
  const ifIndex = p.indexOf(goto) - 1;
  p.splice(ifIndex, 3,
    { command: "store", target: p[ifIndex].target, value: goto.target },
    { command: "if", target: `!\${${goto.target}}` }
  );
  const endIndex = p.indexOf(end);
  p.splice(endIndex + 1, 0,
    { command: "end" },
    { command: "if", target: `\${${goto.target}}` },
    goto,
    { command: "end" }
  );
}

export function transformInward(procedure, goto, label) {
  const block = findFirstEnclosingBlock(procedure, procedure.indexOf(goto), label);
  const p = [...procedure];
  if (block.command !== "else") {
    // outward loop movement
    transformInwardLoopConditional(p, goto, block, label);
  } else {
    // outward conditional movement
    transformInwardElseConditional(p, goto, block, label);
  }
  return p;
}

function transformInwardLoopConditional(p, goto, block, label) {
  const ifIndex = p.indexOf(goto) - 1;
  p.splice(ifIndex, 3,
    { command: "store", target: p[ifIndex].target, value: goto.target },
    { command: "if", target: `!\${${goto.target}}` }
  );
  const blockIndex = p.indexOf(block);
  p.splice(blockIndex, 1,
    { command: "end" },
    { command: block.command, target: `\${${goto.target}} || ${block.target}` },
    { command: "if", target: `\${${goto.target}}` },
    goto,
    { command: "end" }
  );
  const labelIndex = p.indexOf(label);

  // make sure that the next time the while condition isn't shorted
  if (block.command === "while") {
    p.splice(labelIndex + 1, 0,
      { command: "store", target: "false", value: goto.target }
    );
  }
  return p;
}

function transformInwardElseConditional() {
  throw new Error("not implemented");
}

export function lift(procedure, goto, label) {
  const p = [
    { command: "store", target: "false", value: goto.target },
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
    goto,
    {
      command: "end"
    }
  );
  const ifIndex = p.lastIndexOf(goto) - 1;
  p.splice(ifIndex, 3,
    {
      command: "store",
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

function findFirstEnclosingBlock(procedure, offset, statement) {
  const blocks = [];
  for (let i = offset; i < procedure.length; i++) {
    const block = procedure[i];
    if (isBlock(block)) {
      blocks.push(block);
    } else if (isBlockEnd(block)) {
      blocks.pop(block);
    } else if (block === statement) {
      return blocks[0];
    }
  }
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
    level = levelIncrement(procedure[index], level);
  }
  return procedure[index];
}

function findMatchingLabel(listOfLabels, goto) {
  return listOfLabels.find(statement => (statement.command === "label" && statement.target === goto.target));
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

function levelIncrement(statement, level = 0) {
  if (isBlock(statement)) {
    level++;
  } else if (isBlockEnd(statement)) {
    level--;
  }
  return level;
}

function calculateLevel(procedure, statement) {
  // ignore the goto condition in terms of level
  let level = statement.command === "goto" ? -1 : 0;
  for (let index = 0; index < procedure.length; index++) {
    level = levelIncrement(procedure[index], level);
    if (procedure[index] === statement) return level;
  }
}

function isConditionalGoto(procedure, goto) {
  const index = procedure.indexOf(goto);
  return (procedure[index].command === "goto" && procedure[index - 1].command === "if" && procedure[index + 1].command === "end");
}

// for this calculation a tree would've been a better data structure
export function relation(procedure, goto, label) {
  let level, first, outOfBlock;
  for (let index = 0; index < procedure.length; index++) {
    const statement = procedure[index];
    // if its a conditional goto, decrease the level, and skip the end
    if (isConditionalGoto(procedure, statement)) {
      level--;
      index++;
    } else {
      level = levelIncrement(statement, level);
    }
    // 0 is truthy
    if (first !== undefined && outOfBlock === undefined && level < first) {
      outOfBlock = level;
    } else if (first !== undefined && outOfBlock !== undefined && level > outOfBlock && !isBlock(statement)) {
      return Relationship.IndirectlyRelated;
    }

    if (statement === goto || statement === label) {
      if (first === undefined) {
        // matched the first one
        first = level;
      } else if (first !== undefined) {
        // matched the second one
        if (level === first) {
          return Relationship.Siblings;
        } else {
          return Relationship.DirectlyRelated;
        }
      }
    }
  }
}

export const Relationship = {
  Siblings: "siblings",
  DirectlyRelated: "related",
  IndirectlyRelated: "unrelated"
};

export function prettyPrint(procedure) {
  let level = 0;
  return procedure.map(statement => {
    if (isBlockEnd(statement)) {
      level--;
    }
    let r = `${"  ".repeat(level)}${statement.command} ${statement.target || ""}`;
    if (isBlock(statement)) {
      level++;
    }
    return r;
  }).join("\n");
}
