{
  WebDriverWait wait = new WebDriverWait(driver, {{{ms-to-s:timeout}}});
  wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable({{{locator}}})));
}