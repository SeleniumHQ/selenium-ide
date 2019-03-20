import {
  generateArgumentMarkdown,
  generateCommandMarkdown,
  generateApiDocs,
} from '../../../scripts/website/generate-api-docs'

describe('generate api docs', () => {
  it.skip('stdout for debugging', () => {
    console.log(generateArgumentMarkdown()) // eslint-disable-line
    console.log(generateCommandMarkdown()) // eslint-disable-line
  })
  it.skip('generate api docs files', () => {
    generateApiDocs()
  })
})
