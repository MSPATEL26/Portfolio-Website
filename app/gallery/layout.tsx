import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photo gallery of Mohammed Saqib Patel — college, hackathons, events, and personal moments.',
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
