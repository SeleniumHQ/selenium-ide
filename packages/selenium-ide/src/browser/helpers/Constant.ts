const Constant =
  <Type>(value: Type) =>
  (): Type =>
    value

export default Constant
