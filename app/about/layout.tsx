import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Mohammed Saqib Patel — Full Stack Developer & DevOps Engineer based in Pune, India. Building production-grade web applications and scalable infrastructure.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
