{
  WebDriverWait wait = new WebDriverWait(driver, "${ms-to-s:timeout}");
  WebElement element = driver.findElement("${locator}");
  wait.until(ExpectedConditions.stalenessOf(element));
}