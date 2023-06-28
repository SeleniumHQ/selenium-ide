    {
      String value = driver.findElement({{{locator}}}).getAttribute("value");
      assertThat(value, is(not({{{text:expectedValue}}})));
    }