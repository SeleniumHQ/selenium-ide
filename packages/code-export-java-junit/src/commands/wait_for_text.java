{
  WebDriverWait wait = new WebDriverWait(driver, "${ms-to-s:timeout}");
  wait.until(ExpectedConditions.textToBe("${locator}", "${text}"));
}
