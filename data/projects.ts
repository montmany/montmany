import projectsData from "./projects.json"

export type ProjectStatus = "live" | "progress" | "not-started"

export interface ProjectLinks {
  appStore: string
  playStore: string
  web: string
  repo: string
}

export interface Project {
  slug: string
  name: string
  month: number
  description: string
  status: ProjectStatus
  links: ProjectLinks
}

export const projects = projectsData as Project[]
