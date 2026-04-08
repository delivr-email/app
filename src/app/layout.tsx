import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resend',
  description: 'Email API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
