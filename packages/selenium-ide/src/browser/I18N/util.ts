interface RecursiveShape {
  [key: string]: boolean | string | RecursiveShape
}

const processOneLevel = <T extends RecursiveShape>(
  prefix: string,
  getValue: (key: string, value: string) => any,
  obj: T
): T => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const keyPath = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') {
      // @ts-expect-error our shape traversal kinda sucks :(
      acc[key] = processOneLevel<T>(keyPath, getValue, value)
    } else {
      // @ts-expect-error our shape traversal kinda sucks :(
      acc[key] = getValue(keyPath, value)
    }
    return acc
  }, {} as T)
}

/**
 * Take this nested object, keep the shape, but make the final keys the dot delimited string
 * path of the nested key
 */

export const transformNestedObject = <T extends RecursiveShape>(
  getValue: (key: string, value: string) => any,
  obj: T
): T => processOneLevel<T>('', getValue, obj)

const flattenOneLevel = <T extends RecursiveShape>(
  prefix: string,
  getValue: (key: string, value: string) => any,
  target: Record<string, any>,
  source: T
): Record<string, any> => {
  return Object.entries(source).reduce((acc, [key, value]) => {
    const keyPath = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') {
      flattenOneLevel<T>(keyPath, getValue, target, value as T)
    } else {
      if (typeof value !== 'function') {
        // @ts-expect-error our shape traversal kinda sucks :(
        acc[keyPath] = getValue(keyPath, value)
      }
    }
    return acc
  }, target as T)
}

export const flattenNestedObject = <T extends RecursiveShape>(
  obj: T
): Record<string, any> => flattenOneLevel('', (_k, v) => v, {}, obj)

export type SupportedLanguage = 'en' | 'zh'

/**
 * The app has English and Chinese messages. Chinese locales (zh, zh-CN,
 * zh-TW, ...) use Chinese, everything else uses English.
 */
export const getSupportedLanguage = (locale: string): SupportedLanguage =>
  locale.toLowerCase().startsWith('zh') ? 'zh' : 'en'
