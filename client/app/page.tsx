'use client'

import ConnectWalletButton from '../components/ConnectWalletButton'
import { WalletProvider } from '../components/WalletContext'

export default function Page() {
  return (
    <WalletProvider>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to MultiSig Wallet</h1>
        <ConnectWalletButton />
      </main>
    </WalletProvider>
  )
}
