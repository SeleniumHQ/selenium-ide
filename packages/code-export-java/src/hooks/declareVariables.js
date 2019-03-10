let result = `
    private WebDriver driver;
    private HashMap<String, Object> vars = new HashMap<>();
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
