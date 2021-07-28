const getEntryColor = ({ id }: { id: string }, activeID: string | null) =>
  id === activeID ? 'bg-blue-100' : 'bg-gray-100'

export default getEntryColor
