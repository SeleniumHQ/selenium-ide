{
  WebElement dragged = driver.findElement({{{locator:dragged}}});
  WebElement dropped = driver.findElement({{{dropped}}});
  Actions builder = new Actions(driver);
  builder.dragAndDrop(dragged, dropped).perform();
}