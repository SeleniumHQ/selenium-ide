import parser from 'ua-parser-js'

export const isProduction = process.env.NODE_ENV === 'production'

export const isStaging = process.env.NODE_ENV === 'staging'

export const isTest = process.env.NODE_ENV === 'test'

export const userAgent = parser(window.navigator.userAgent)

export function isChrome() {
  userAgent.browser.name === 'Chrome'
}

export function isFirefox() {
  userAgent.browser.name === 'Firefox'
}

/**
 * Search a docTree for a node with a specific key and value
 * @param {object} docTree - document tree
 * @param {string} targetKey - key on document node to search for
 * @param {string} targetValue - value on document node to search for
 * @returns {object} documentNode
 */
export function searchDocTree(docTree, targetKey, targetValue) {
  if (docTree.hasOwnProperty(targetKey) && docTree[targetKey] === targetValue) {
    return docTree
  } else if (Array.isArray(docTree.children)) {
    const tree =
      docTree.nodeName === 'IFRAME'
        ? docTree.contentDocument.children
        : docTree.children
    for (let i = 0; i < tree.length; i++) {
      const result = searchDocTree(tree[i], targetKey, targetValue)
      if (result) {
        return result
      }
    }
  } else {
    return null
  }
}
