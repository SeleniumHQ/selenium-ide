{
  WebElement element = driver.findElement({{{locator}}});
  if (!element.isSelected()) {
    element.click();
  }
}