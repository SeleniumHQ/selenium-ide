import { ProjectShape } from '@seleniumhq/side-model'

/**
 * Returns the current project being edited
 */
export type Shape = () => Promise<ProjectShape>
