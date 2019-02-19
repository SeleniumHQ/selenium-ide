---
id: popup
title: Plugins Popup API
sidebar_label: Popup
---

The Popup API deals with popups which the user can see.  

This API is prefix with `/popup`.  

**Note:** Selenium IDE displays one popup at a time, sending a new one will cancel the previous popup.  

Because of this, if Selenium IDE returned `false` if means **cancel**, no action should be taken, because the popup might have been dismissed.

### `POST /popup/alert`

Used to display alerts inside Selenium IDE.  

This can get tiring and annoying for users, so use this lightly!

```
{
  uri: "/popup/alert",
  verb: "post",
  message: "message to show the user",
  cancel: "cancel label",
  confirm: "confirm label"
}
```

- `message` - the message body.
- `cancel` - optional, the cancel button text.
- `confirm` - optional, the confirm button text.

#### Returns

Returns `true` if the confirm button was clicked, or `false` if the cancel button was clicked.
