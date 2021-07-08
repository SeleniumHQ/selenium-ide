export type ConstantShape = <T>(val: T) => () => T

const Constant: ConstantShape = (value) => () => value

export default Constant
