import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credentials',
  description:
    'Professional certifications of Mohammed Saqib Patel — AWS Solutions Architect Associate, Oracle Cloud, GitHub Foundations, Neo4j Professional, and MERN Full Stack.',
}

export default function CredentialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
