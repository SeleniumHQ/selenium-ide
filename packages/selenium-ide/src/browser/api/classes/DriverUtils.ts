export const UniqueIdentifier = '!!!SELENIUM_IDE_IDENTIFIER_HERE!!!'

export const sendMessage = (message: any) => {
  console.log(UniqueIdentifier + JSON.stringify(message))
}