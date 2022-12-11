export const capitalize = (str: string) =>
  str.split(' ').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
