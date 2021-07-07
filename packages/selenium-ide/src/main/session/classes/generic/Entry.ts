export interface GenericData {
  id: number
}

export abstract class GenericEntry<DATA extends GenericData> {
  abstract data: DATA
  abstract id: number
}
