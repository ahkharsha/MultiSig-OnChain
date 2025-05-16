'use client'

import './globals.css'
import { WalletProvider } from '../components/WalletContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{typeof window !== 'undefined' ? <WalletProvider>{children}</WalletProvider> : null}</body>
    </html>
  )
}
