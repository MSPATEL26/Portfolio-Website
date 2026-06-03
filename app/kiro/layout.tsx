import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KIRO — AI Assistant',
  description:
    'Chat with KIRO, the AI assistant on Saqib Patel\'s portfolio. Ask about projects, skills, experience, and more.',
}

export default function KiroLayout({ children }: { children: React.ReactNode }) {
  return children
}
