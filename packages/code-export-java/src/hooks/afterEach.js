let result = `
    @After
    public void tearDown() {
        driver.quit();
    }
`

function register(statement) {
  result += statement + '\r\n'
}

function emit() {
  return result
}

export default {
  emit,
  register,
}
