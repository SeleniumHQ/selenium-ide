import CSharpNUnit from '@seleniumhq/code-export-csharp-nunit'
import CSharpXUnit from '@seleniumhq/code-export-csharp-xunit'
import JavaJunit from '@seleniumhq/code-export-java-junit'
import JavascriptMocha from '@seleniumhq/code-export-javascript-mocha'
import PythonPytest from '@seleniumhq/code-export-python-pytest'
import RubyRSpec from '@seleniumhq/code-export-ruby-rspec'
import { fileWriter, LanguageEmitter } from '@seleniumhq/side-code-export'
import BaseController from '../Base'

const builtinFormats = [
  CSharpNUnit,
  CSharpXUnit,
  JavaJunit,
  JavascriptMocha,
  PythonPytest,
  RubyRSpec,
]

/**
 * This just contains a list of menus in the folder
 * and makes it easy to open a menu by specifying a name.
 */
export default class OutputFormatsController extends BaseController {
  customFormats: LanguageEmitter[] = []
  async getFormats() {
    return this.customFormats
      .concat(builtinFormats)
      .map((format) => format?.opts?.name)
  }
  async registerFormat(format: never) {
    this.customFormats.push(format)
  }
  async unregisterFormat(name: string) {
    const index = this.customFormats.findIndex((f) => f?.opts?.name === name)
    if (index === -1) return 0
    this.customFormats.splice(index, 1)
    return 1
  }
  async exportSuiteToFormat(formatName: string, suiteID: string) {
    const format: LanguageEmitter =
      this.customFormats.find((f) => f?.opts.name === formatName) ||
      (builtinFormats.find(
        (f) => f?.opts.name === formatName
      ) as LanguageEmitter)
    if (!format) throw new Error(`Format ${formatName} not found`)
    const project = await this.session.projects.getActive()
    const outputPath = await this.session.dialogs.openSave()
    if (outputPath.canceled) return
    const filepath = outputPath.filePath as string
    const suiteName = project.suites.find((s) => s.id === suiteID)?.name!
    const suiteCode = await fileWriter.emitSuite(format, project, suiteName)

    return fileWriter.writeFile(
      filepath,
      suiteCode.body,
      this.session.projects.filepath
    )
  }
  async exportTestToFormat(formatName: string, testID: string) {
    const format: LanguageEmitter =
      this.customFormats.find((f) => f?.opts.name === formatName) ||
      (builtinFormats.find(
        (f) => f?.opts.name === formatName
      ) as LanguageEmitter)
    if (!format) throw new Error(`Format ${formatName} not found`)
    const project = await this.session.projects.getActive()
    const outputPath = await this.session.dialogs.openSave()
    if (outputPath.canceled) return
    const filepath = outputPath.filePath as string
    const testName = project.tests.find((t) => t.id === testID)!.name
    const testCode = await fileWriter.emitTest(format, project, testName)

    return fileWriter.writeFile(
      filepath,
      testCode.body,
      this.session.projects.filepath
    )
  }
}
