import StringEscape from 'js-string-escape'

export function escape(text) {
  return StringEscape(text)
}

export default {
  escape,
}
