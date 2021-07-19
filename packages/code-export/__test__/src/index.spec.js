import { emitCommand } from '../../src'

describe('Code Export Python pytest', () => {
  it('should export a test', async () => {
    let command = await emitCommand('python-pytest', {
      command: 'click',
      target: "//form[input/@name='email']",
      value: '',
    })
    expect(command).toEqual(
      'self.driver.find_element(By.XPATH, "//form[input/@name=\\\'email\\\']").click()'
    )
  })
})
