'use client'

import './globals.css'
import { WalletProvider } from '../components/WalletContext'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import Head from 'next/head'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="bg-black">
      <Head>
        <title>MultiSig Wallet</title>
        <meta name="description" content="Secure multi-signature wallet" />
      </Head>
      <body className="min-h-screen bg-black text-white">
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid #FF4320',
            },
          }}
        />
        {typeof window !== 'undefined' && (
          <WalletProvider>{children}</WalletProvider>
        )}
      </body>
    </html>
  )
}