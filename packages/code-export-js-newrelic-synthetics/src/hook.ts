import { HookFunctionInputs } from 'side-code-export'

const emitters = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  declareDependencies,
  declareMethods: empty,
  declareVariables,
  inEachBegin: empty,
  inEachEnd: empty,
}

export default emitters

function afterAll() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [],
    },
    registrationLevel: 1,
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        {
          level: 0,
          statement: `// dependencies go here`,
        },
      ],
    },
  }
  return params
}

function declareVariables() {
  const params = {
    startingSyntax: {
      commands: [
        {
          level: 0,
          statement: `// variables go here`,
        },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
