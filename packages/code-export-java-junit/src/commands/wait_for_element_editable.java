{
  WebDriverWait wait = new WebDriverWait(driver, {{{ms-to-s:timeout}}});
  wait.until(ExpectedConditions.elementToBeClickable({{{locator}}}));
}
