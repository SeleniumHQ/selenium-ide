import dependencies from './declareDependencies'
import variables from './declareVariables'
import beforeAll from './beforeAll'
import beforeEach from './beforeEach'
import afterEach from './afterEach'
import afterAll from './afterAll'
import inEachBegin from './inEachBegin'
import inEachEnd from './inEachEnd'
import methods from './declareMethods'

const hooks = [
  dependencies,
  variables,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  inEachBegin,
  inEachEnd,
  methods,
]

export function clearHooks() {
  hooks.forEach(hook => {
    hook.clear()
  })
}

export default {
  dependencies,
  variables,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  inEachBegin,
  inEachEnd,
  methods,
}
