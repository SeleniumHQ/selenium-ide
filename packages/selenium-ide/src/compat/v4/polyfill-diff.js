/**
 * Gets a diff between two objects procedurally
 * No, I certainly did not write this
 * https://stackoverflow.com/questions/8572826/generic-deep-diff-between-two-objects
 * @param {*} object1
 * @param {*} object2
 */
class DeepDiffMapper {
  static VALUE_CREATED = 'created'
  static VALUE_UPDATED = 'updated'
  static VALUE_DELETED = 'deleted'
  static VALUE_UNCHANGED = 'unchanged'
  map(obj1, obj2) {
    if (this.isValue(obj1) || this.isValue(obj2)) {
      return {
        type: this.compareValues(obj1, obj2),
        data: obj1 === undefined ? obj2 : obj1,
      }
    }

    const diff = {}
    for (const key in obj1) {
      let value2 = undefined
      if (obj2[key] !== undefined) {
        value2 = obj2[key]
      }

      diff[key] = this.map(obj1[key], value2)
    }
    for (const key2 in obj2) {
      if (diff[key2] !== undefined) {
        continue
      }

      diff[key2] = this.map(undefined, obj2[key2])
    }

    return diff
  }
  compareValues(value1, value2) {
    if (value1 === value2) {
      return DeepDiffMapper.VALUE_UNCHANGED
    }
    if (
      this.isDate(value1) &&
      this.isDate(value2) &&
      value1.getTime() === value2.getTime()
    ) {
      return DeepDiffMapper.VALUE_UNCHANGED
    }
    if (value1 === undefined) {
      return DeepDiffMapper.VALUE_CREATED
    }
    if (value2 === undefined) {
      return DeepDiffMapper.VALUE_DELETED
    }
    return DeepDiffMapper.VALUE_UPDATED
  }
  isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]'
  }
  isDate(x) {
    return Object.prototype.toString.call(x) === '[object Date]'
  }
  isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]'
  }
  isValue(x) {
    return !this.isObject(x) && !this.isArray(x)
  }
}

export default DeepDiffMapper
