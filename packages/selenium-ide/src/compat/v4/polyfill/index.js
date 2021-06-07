/**
 * I would rather over-engineer one index file than maintain N
 * So this just uses require.context to dynamically build
 * the shape of the polyfill object to match its folder structure
 */

const cache = {}
const polyFillRequire = require.context('./', true, /.js$/)
polyFillRequire.keys().forEach(file => {
  if (file === './index.js') {
    return
  }
  const moduleBody = polyFillRequire(file)
  const usefulFileParts = file.slice(2, -3).split('/')
  let ref = cache
  const moduleProperty = usefulFileParts.pop()
  usefulFileParts.forEach(segment => {
    if (!ref[segment]) ref[segment] = {}
    ref = ref[segment]
  })
  ref[moduleProperty] = moduleBody.default
})

export default cache
