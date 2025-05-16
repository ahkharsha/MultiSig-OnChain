'use client'

import './globals.css'
import { WalletProvider } from '../components/WalletContext'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {typeof window !== 'undefined' && (
          <WalletProvider>{children}</WalletProvider>
        )}
      </body>
    </html>
  )
}