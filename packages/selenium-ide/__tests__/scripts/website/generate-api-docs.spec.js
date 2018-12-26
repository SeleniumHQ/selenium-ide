import {
  generateArgumentMarkdown,
  generateCommandMarkdown,
  generateApiDocs,
} from '../../../scripts/website/generate-api-docs'

describe('generate api docs', () => {
  it.skip('stdout for debugging', () => {
    console.log(generateArgumentMarkdown())
    console.log(generateCommandMarkdown())
  })
  it.skip('generate api docs files', () => {
    generateApiDocs()
  })
})
