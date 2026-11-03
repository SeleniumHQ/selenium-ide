import loadI18NData from '../src/I18N'
import ArgTypes from '../src/ArgTypes'
import Commands from '../src/Commands'
import { argTypes as zhArgTypes } from '../src/I18N/zh/ArgTypes'
import zhCommands from '../src/I18N/zh/Commands'

describe('loadI18NData', () => {
  it('loads English', async () => {
    const data = await loadI18NData('en')
    expect(data.ArgTypes).toBe(ArgTypes)
    expect(data.Commands).toBe(Commands)
  })
  it('loads Chinese from a code with a region', async () => {
    const data = await loadI18NData('zh-CN')
    expect(data.ArgTypes).toBe(zhArgTypes)
    expect(data.Commands).toBe(zhCommands)
  })
  it('falls back to English', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const data = await loadI18NData('toString')
    expect(data.Commands).toBe(Commands)
  })
})
