import { sanitizeProjectName } from '../../IO/filesystem'

describe('filesystem', () => {
  describe('save', () => {
    describe('filename', () => {
      it('allows alpha-numeric characters', () => {
        const input = 'asdf1234'
        expect(sanitizeProjectName(input)).toEqual(input)
      })
      it('allows limited special characters', () => {
        let input = 'asdf-1234'
        expect(sanitizeProjectName(input)).toEqual(input)
        input = 'asdf_1234'
        expect(sanitizeProjectName(input)).toEqual(input)
        input = 'asdf.1234'
        expect(sanitizeProjectName(input)).toEqual(input)
        input = 'asdf 1234'
        expect(sanitizeProjectName(input)).toEqual(input)
      })
      it('ignores illegal filesystem characters', () => {
        const input = 'blah:/blah'
        expect(sanitizeProjectName(input)).toEqual('blahblah')
      })
      it('with URI returns the root', () => {
        const input = 'http://a.b.com'
        expect(sanitizeProjectName(input)).toEqual('a.b.com')
      })
    })
  })
})
