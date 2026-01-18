import type { Metadata } from 'next'
import '@/styles/globals.css'
import MuiProviders from '@/theme/MuiProviders'

export const metadata: Metadata = {
  title: 'Sentiment Reality | Market Sentiment Analysis',
  description: 'Analyze when market sentiment diverges from actual performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MuiProviders>
          <main>{children}</main>
        </MuiProviders>
      </body>
    </html>
  )
}
