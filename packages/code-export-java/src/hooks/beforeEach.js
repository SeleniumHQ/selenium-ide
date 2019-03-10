let result = `
    @Before
    public void setUp() {
        driver = new FirefoxDriver();
`

function register(statement) {
  result += statement + '\r\n'
}

function emit() {
  return (
    result +
    `    }
`
  )
}

export default {
  emit,
  register,
}
