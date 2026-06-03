import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected works by Mohammed Saqib Patel — RealityCheck AI, Streakly, InkBoard, Book Inventory and more. Every project deployed and live.',
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
