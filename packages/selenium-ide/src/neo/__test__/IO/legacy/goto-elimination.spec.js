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

import { transformToConditional, eliminateGoto, eliminateLabel, transformOutward } from "../../../IO/legacy/goto-elimination";

describe("goto conditional conversion", () => {
  it("should convert unconditional goto to conditional goto", () => {
    const procedure = [
      {
        command: "goto",
        target: "label_1"
      }
    ];
    expect(transformToConditional(procedure[0])).toEqual([
      {
        command: "if",
        target: "true"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      }
    ]);
  });
  it("should convert compound goto to conditional goto", () => {
    const procedure = [
      {
        command: "gotoIf",
        target: "condition",
        value: "label_1"
      }
    ];
    expect(transformToConditional(procedure[0])).toEqual([
      {
        command: "if",
        target: "condition"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      }
    ]);
  });
});

describe("goto elimination transformation", () => {
  it("should eliminate goto before label statement", () => {
    const procedure = [
      {
        command: "statement"
      },
      {
        command: "if",
        target: "true"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      }
    ];
    expect(eliminateGoto(procedure, procedure[2], procedure[7])).toEqual([
      {
        command: "statement"
      },
      {
        command: "if",
        target: "!true"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "end"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      }
    ]);
  });
  it("should eliminate goto after label statement", () => {
    const procedure = [
      {
        command: "statement"
      },

      {
        command: "statement"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "if",
        target: "true"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      }
    ];
    expect(eliminateGoto(procedure, procedure[6], procedure[2])).toEqual([
      {
        command: "statement"
      },

      {
        command: "statement"
      },
      {
        command: "do"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "endDo",
        target: "true"
      },
      {
        command: "statement"
      }
    ]);
  });
});

describe("label elimination", () => {
  it("should eliminate labels", () => {
    const label = {
      command: "label",
      target: "label_1"
    };
    const procedure = [
      {
        command: "statement"
      },
      label,
      {
        command: "statement"
      }
    ];
    expect(eliminateLabel(procedure, label)).toEqual([
      {
        command: "statement"
      },
      {
        command: "statement"
      }
    ]);
  });
});

describe("outward movement transformation", () => {
  it("should move goto out of a while", () => {
    const procedure = [
      {
        command: "statement"
      },
      {
        command: "while",
        target: "condition"
      },
      {
        command: "statement"
      },
      {
        command: "if",
        target: "condition2"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      }
    ];
    expect(transformOutward(procedure)).toEqual([
      {
        command: "statement"
      },
      {
        command: "while",
        target: "condition"
      },
      {
        command: "statement"
      },
      {
        command: "storeValue",
        target: "condition2",
        value: "label_1"
      },
      {
        command: "if",
        target: "${label_1}"
      },
      {
        command: "break"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "end"
      },
      {
        command: "if",
        target: "${label_1}"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      }
    ]);
  });
  it("should move goto out of an if", () => {
    const procedure = [
      {
        command: "statement"
      },
      {
        command: "if",
        target: "condition"
      },
      {
        command: "statement"
      },
      {
        command: "if",
        target: "condition2"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      }
    ];
    expect(transformOutward(procedure)).toEqual([
      {
        command: "statement"
      },
      {
        command: "if",
        target: "condition"
      },
      {
        command: "statement"
      },
      {
        command: "storeValue",
        target: "condition2",
        value: "label_1"
      },
      {
        command: "if",
        target: "!${label_1}"
      },
      {
        command: "statement"
      },
      {
        command: "statement"
      },
      {
        command: "end"
      },
      {
        command: "end"
      },
      {
        command: "if",
        target: "${label_1}"
      },
      {
        command: "goto",
        target: "label_1"
      },
      {
        command: "end"
      },
      {
        command: "statement"
      },
      {
        command: "label",
        target: "label_1"
      },
      {
        command: "statement"
      }
    ]);
  });
});
