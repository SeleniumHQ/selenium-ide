const resolve = require('resolve')

/**
 * @typedef {{
    basedir: string
    browser?: boolean
    defaultResolver: (request: string, options: ResolverOptions) => string
    extensions?: readonly string[]
    moduleDirectory?: readonly string[]
    paths?: readonly string[]
    rootDir?: string
  }} ResolverOptions
 */

/**
 * @param {string} request
 * @param {ResolverOptions} options
 */
module.exports = (request, options) => {
  try {
    return resolve.sync(request, {
      basedir: options.basedir,
      extensions: options.extensions,
      preserveSymlinks: true,
    })
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      cosole.log('module not found')
      return options.defaultResolver(request, options)
    }
    throw e
  }
}
