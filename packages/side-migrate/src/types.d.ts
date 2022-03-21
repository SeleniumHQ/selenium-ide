declare module 'unescape' {
  type Unescape = (str: string) => string
  const unescape: Unescape
  export = unescape
}
