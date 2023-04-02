import language from '@seleniumhq/code-export-python-pytest'

/**
 * This is an example of taking a stock export format and modifying it
 * to add a custom command.
 *
 * To modify it further, I would recommend looking at the source code
 * for the format you are modifying.
 */

language.register.command(
  'customClick',
  async (target) =>
    `self.driver.find_element(${await language.emit.locator(target)}).click()`
)

export default language
