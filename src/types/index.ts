import type { User, Profile, Resume, Job, Application, Notification } from './database'
export * from './resume-extractor'

export type { User, Profile, Resume, Job, Application, Notification }
export type ApplicationWithJob = Application & { job?: Job }
