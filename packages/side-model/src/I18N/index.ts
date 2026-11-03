import { ArgTypes } from '../ArgTypes'
import Commands from '../Commands'
import enArgTypes from './en/ArgTypes'
import enCommands from './en/Commands'
import { argTypes as zhArgTypes } from './zh/ArgTypes'
import zhCommands from './zh/Commands'

type I18NModelDataShape = {
  ArgTypes: ArgTypes
  Commands: typeof Commands
}

// Imported statically, so bundlers include every language
const languages: Record<string, I18NModelDataShape> = {
  en: { ArgTypes: enArgTypes, Commands: enCommands },
  zh: { ArgTypes: zhArgTypes, Commands: zhCommands },
}

type SupportedLanguages = 'en' | 'zh'

// Takes a language code like "zh" or "zh-CN". Unknown languages get English.
const loadI18NData = async (
  languageCode: SupportedLanguages | string
): Promise<I18NModelDataShape> => {
  const language = languageCode.slice(0, 2)
  if (!Object.prototype.hasOwnProperty.call(languages, language)) {
    console.error(`Unsupported language code: ${languageCode}`)
    console.warn('Falling back to english for now')
    return languages.en
  }
  return languages[language]
}

export default loadI18NData
