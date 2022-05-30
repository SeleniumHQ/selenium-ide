# Selenium IDE plugins development and usage

This document covers development and usage of Selenium IDE plugins to support behavior overrides and new commands to support various web recording and playback requirements for specialized web interfaces which may not be supported by the base IDE.

## Plugin Development

Begin by copying an example plugin folder, e.g. the selenium-ide/packages/side-plugin-example/ to a new folder location, e.g. 'myPlugin' relative to your related SIDE file location. For example, if your .side file is located at /user/me/projects/myTests.side, you can have the below folder setup.

```
/user/me/projects/myTests.side
/user/me/projects/myPlugin/
```

The key files in your plugin folder are below.

| File/Folder          | Notes                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| src/index.ts         | Declares the plugin command structure through 'PluginShape'                                             |
| src/preload/index.ts | This optional file defines the code to run while recording, including providing the custom command name |
| src/package.json | Various notations for your plugin. Note, you must provide a unique "name" value |

## src/preload/index.ts
The PluginPreloadShape allows you to inject JavaScript such as an event listener

```JavaScript
const preloadPlugin: PluginPreloadShape = (sendMessage: SendMessage) => {
  document.addEventListener('click', () => {
    clickCount += 1
  })
```

This will return a hooks.onCommandRecorded to inject JavaScript behaviors on recording, and to provide an override command name hooks.onCommandRecorded.action.command.command which should match your replacement command name.  

```JavaScript
 return {
    hooks: {
      onCommandRecorded: (command, event) => {
        console.debug('Recorded command', command, event)
        if (command.command !== 'click') return
        sendMessage('Click!')
        return {
          action: 'update',
          command: {
            ...command,
            command: 'customClick',
          },
        }
      },
    },
  }
```

## Registering the plugin
Once the plugin is created, it should be registered with the IDE for your project to use. After you have loaded your project in the IDE, navigate to the "Config" panel, and from the "Project Plugins" section, add your plugin folder as the relative path to your SIDE file, e.g. 
```
./myPlugin/
```

## Plugin usage

Once the plugin is added to a SIDE project, the newly added command will be used when recording, if the plugin impacts the recording process.  The plugin command may also be used just as any other standard IDE command in the test editor. 