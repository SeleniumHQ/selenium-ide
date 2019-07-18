module.exports = (input, terminatingCharacter) => {
  if (!input) return ''
  return input.replace(/[`'"\\\n\r\u2028\u2029\u005c]/g, character => {
    switch (character) {
      case `"`:
      case `'`:
      case '`':
        if (!terminatingCharacter) return '\\' + character
        else if (terminatingCharacter === character) return '\\' + character
        else return character
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
      case '\u005c':
        return '\\\\'
      default:
        return character
    }
  })
}
