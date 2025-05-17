// app/layout.tsx
'use client'

import './globals.css'
import { WalletProvider } from '../components/WalletContext'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import NetworkGuard from '../components/NetworkGuard'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="bg-black h-full">
      <Head>
        <title>MultiSig Wallet</title>
        <meta name="description" content="Secure multi-signature wallet" />
      </Head>
      <body className="h-screen flex flex-col overflow-hidden">
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
          <WalletProvider>
            <Header />
            <main className="flex-1 flex items-center justify-center overflow-y-auto">
              <NetworkGuard>
                {children}
              </NetworkGuard>
            </main>
            <Footer />
          </WalletProvider>
        )}
      </body>
    </html>
  )
}