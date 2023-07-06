{
  WebElement element = driver.findElement({{{locator});
  js.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '{{{content}'}}}, element);
}