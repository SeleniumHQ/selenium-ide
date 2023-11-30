/**
 * Return a list of targets that are at the given coordinates.
 */
export type Shape = (x: number, y: number) => Promise<[string, string][]>
