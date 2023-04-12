import fs from 'fs'
import path from 'path'
import codeExport from '../../src'
const emitTest = codeExport.emit.test
const emitSuite = codeExport.emit.suite
import Command from '../../src/command'
import { project as projectProcessor } from 'side-code-export'

describe('Code Export JavaScript New Relic Synthetics', () => {
  it('should pass', () => {
    expect(1).toBe(1)
  })
})
