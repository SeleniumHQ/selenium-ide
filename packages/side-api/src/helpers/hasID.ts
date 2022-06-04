export const hasID = (id: string) => (obj: { id: string }) => obj.id === id

export const notHasID = (id: string) => (obj: { id: string }) => obj.id !== id