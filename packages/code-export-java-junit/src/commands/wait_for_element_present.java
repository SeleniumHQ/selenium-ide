{
  WebDriverWait wait = new WebDriverWait(driver, "${ms-to-s:timeout}");
  wait.until(ExpectedConditions.presenceOfElementLocated("${locator}"));
}