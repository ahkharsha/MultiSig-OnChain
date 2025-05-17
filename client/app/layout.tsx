'use client'

import './globals.css'
import { WalletProvider } from '../components/WalletContext'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import Head from 'next/head'
import Footer from '../components/Footer'

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
      <body className="h-full flex flex-col">
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
            <div className="flex flex-col h-full">
              <div className="flex-none">
                {children}
              </div>
              <Footer />
            </div>
          </WalletProvider>
        )}
      </body>
    </html>
  )
}