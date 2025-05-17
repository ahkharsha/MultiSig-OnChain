'use client'

import ConnectWalletButton from '../components/ConnectWalletButton'

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FF4320] to-[#FF914D]">
            MultiSig Wallet
          </h1>
          <p className="text-gray-400 mb-8">
            Secure, collaborative asset management with multi-signature approvals
          </p>
          <ConnectWalletButton />
        </div>
      </main>
    </div>
  )
}