import dependencies from './declareDependencies'
import variables from './declareVariables'
import beforeAll from './beforeAll'
import beforeEach from './beforeEach'
import afterEach from './afterEach'
import afterAll from './afterAll'
import inEach from './inEach'

const hooks = [
  dependencies,
  variables,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  inEach,
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
  inEach,
}
