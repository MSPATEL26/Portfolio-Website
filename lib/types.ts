export type ProjectStatus = 'coming-soon'

export type Project = {
  id: number
  title: string
  description: string
  tech: string[]
  scope: string
  github: string
  live: string
  image?: string
  status?: 'coming-soon' | 'wip'
}