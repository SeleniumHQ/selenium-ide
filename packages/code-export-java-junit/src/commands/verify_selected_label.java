{
  WebElement element = driver.findElement({{{locator}}});
  String value = element.getAttribute("value");
  String locator = String.format("option[@value='%s']", value);
  String selectedText = element.findElement(By.xpath(locator)).getText();
  assertThat(selectedText, is({{{labelValue}}}));
}