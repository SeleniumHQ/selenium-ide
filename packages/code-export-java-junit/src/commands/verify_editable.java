{
  WebElement element = driver.findElement({{{locator}}});
  Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
  assertTrue(isEditable);
}