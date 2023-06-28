{
  WebElement element = driver.findElement({{{target}}});
  Actions builder = new Actions(driver);
  builder.doubleClick(element).perform();
}