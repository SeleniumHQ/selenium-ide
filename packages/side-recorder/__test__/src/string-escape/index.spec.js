const stringEscape = require('../../../src/string-escape')

describe('String escape', () => {
  it('should return an empty string on undefined input', () => {
    expect(stringEscape()).toEqual('')
  })
  it('should escape backticks', () => {
    expect(stringEscape('AAAAA`BBBBB')).toEqual('AAAAA\\`BBBBB')
  })
  it('should escape backslashes', () => {
    expect(stringEscape('AAAAA\\`BBBBB')).toEqual('AAAAA\\\\\\`BBBBB') // eslint-disable-line
  })
  it('should escape single-quotes', () => {
    expect(stringEscape("AAAAA'BBBBB")).toEqual("AAAAA\\'BBBBB")
  })
  it('should escape double-quotes', () => {
    expect(stringEscape(`AAAAA"BBBBB`)).toEqual(`AAAAA\\"BBBBB`)
  })
  it('should escape newline characters', () => {
    expect(stringEscape(`AAAAA\nBBBBB`)).toEqual(`AAAAA\\nBBBBB`)
    expect(stringEscape(`AAAAA\rBBBBB`)).toEqual(`AAAAA\\rBBBBB`)
  })
  it('should escape unicode line seperators', () => {
    expect(stringEscape(`\u2028`)).toEqual(`\\u2028`)
    expect(stringEscape(`\u2029`)).toEqual(`\\u2029`)
  })
  it('should escape for just the provided target character', () => {
    expect(stringEscape(`AAAAA"BBBBB`, '"')).toEqual(`AAAAA\\"BBBBB`)
    expect(stringEscape(`AAAAA'BBBBB`, '"')).toEqual(`AAAAA'BBBBB`)
    expect(stringEscape('AAAAA`BBBBB', "'")).toEqual('AAAAA`BBBBB')
  })
})
