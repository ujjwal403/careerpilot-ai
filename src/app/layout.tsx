import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CareerPilot AI – Your AI-Powered Career Co-Pilot',
    template: '%s | CareerPilot AI',
  },
  description:
    'Land your dream job faster with AI-powered resume analysis, job matching, and application tracking.',
  keywords: ['career', 'job search', 'AI', 'resume', 'job matching'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-[#fffaf3] text-[#29231e]">
        {children}
      </body>
    </html>
  )
}
