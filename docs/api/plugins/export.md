---
id: export
title: Plugins Export API
sidebar_label: Export
---

Playback API concerns with the exporting capabilities of Selenium IDE.  

This API is prefix with `/export`.  

### `GET /export/location`

Used to get [WebDriver code](https://www.npmjs.com/package/selenium-webdriver) to resolve a locator.

```js
{
  uri: "/export/location",
  verb: "get",
  location: "valid locator"
}
```

- `location` - a valid Selenium IDE locator (e.g. `css=input.text`).

#### Returns

If the locator is valid returns JavaScript WebDriver code that resolves to this element (e.g. `By.css("input.text")`).  

In any other case an error.
