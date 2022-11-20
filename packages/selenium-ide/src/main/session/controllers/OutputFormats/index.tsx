import CSharpCommon from '@seleniumhq/code-export-csharp-commons';
import CSharpNUnit from '@seleniumhq/code-export-csharp-nunit';
import CSharpXUnit from '@seleniumhq/code-export-csharp-xunit';
// @ts-expect-error These packages are untyped
import JavaJunit from '@seleniumhq/code-export-java-junit';
// @ts-expect-error These packages are untyped
import JavascriptMocha from '@seleniumhq/code-export-javascript-mocha';
// @ts-expect-error These packages are untyped
import PythonPytest from '@seleniumhq/code-export-python-pytest';
// @ts-expect-error These packages are untyped
import RubyRSpec from '@seleniumhq/code-export-ruby-rspec';
import BaseController from '../Base'

const builtinFormats = [
  CSharpCommon,
  CSharpNUnit,
  CSharpXUnit,
  JavaJunit,
  JavascriptMocha,
  PythonPytest,
  RubyRSpec,
];

/**
 * This just contains a list of menus in the folder
 * and makes it easy to open a menu by specifying a name.
 */
export default class OutputFormatsController extends BaseController {
  customFormats: any[] = [];
  async getFormats() {
    return this.customFormats.concat(builtinFormats).map((format) => format?.name)
  }
  async registerFormat(format: never) {
    this.customFormats.push(format);
  }
  async unregisterFormat(name: string) {
    const index = this.customFormats.findIndex(f => f?.name === name);
    if (index === -1) return 0;
    this.customFormats.splice(index, 1)
    return 1;
  }
}
