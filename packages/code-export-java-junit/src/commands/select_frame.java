{{# if (eq frameLocation 'relative=top')}}
  driver.switchTo().defaultContent();
{{else if (eq frameLocation 'relative=parent')}}
  driver.switchTo().defaultContent();
{{else}}
{{/if}}

  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `driver.switchTo().frame({{{Math.floor(
        Number(frameLocation.split('index=')[1] as string)
      )});`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, statement: '{' },
        {
          level: 1,
          statement: `WebElement element = driver.findElement({{{await location.emit(
            frameLocation
          )});`,
        },
        { level: 1, statement: 'driver.switchTo().frame(element);' },
        { level: 0, statement: '}' },
      ],
    })
  }