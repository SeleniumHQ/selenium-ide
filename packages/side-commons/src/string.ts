export const capitalize = (str: string) =>
  str.split(' ').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)

export function hyphenToCamelCase(input: string): string {
  return input.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
