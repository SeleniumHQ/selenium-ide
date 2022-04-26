import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer'

export default () => {
  installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: { allowFileAccess: true },
  })
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
}
