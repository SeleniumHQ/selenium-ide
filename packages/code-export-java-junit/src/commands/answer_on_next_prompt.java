{
  Alert alert = driver.switchTo().alert();
  alert.sendKeys("${textToSend}")
  alert.accept();
}
