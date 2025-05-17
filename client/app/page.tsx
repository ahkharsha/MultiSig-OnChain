'use client'

import ConnectWalletButton from '../components/ConnectWalletButton'

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          MultiSig Wallet
        </h1>
        <p className="text-gray-600 mb-8">
          Secure, collaborative asset management with multi-signature approvals
        </p>
        <ConnectWalletButton />
      </div>
    </main>
  )
}