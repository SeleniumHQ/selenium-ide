export const UniqueIdentifier = '!!!SELENIUM_IDE_IDENTIFIER_HERE!!!'

type Message = {
  path: string
  args: any[]
}

let id = 0
export const sendMessage = (message: Message) => {
  const nextID = id++
  console.log(UniqueIdentifier + JSON.stringify({ ...message, id: nextID }))
  return nextID
}