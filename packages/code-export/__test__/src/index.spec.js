import { emitCommand } from '../../src'

describe('Code Export Python pytest', () => {
  it('should export a test', async () => {
    let x = await emitCommand('python-pytest', {
      command: 'click',
      target: "//form[input/@name='email']",
      value: '',
    })
    expect(x).toEqual(
      'self.driver.find_element(By.XPATH, "//form[input/@name=\\\'email\\\']").click()'
    )
  })
})
