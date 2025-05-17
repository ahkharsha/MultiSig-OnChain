'use client'

import { useRouter } from 'next/navigation'
import { useWallet } from './WalletContext'

export default function ConnectWalletButton() {
  const { address } = useWallet()
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-4">
      {address ? (
        <>
          <div className="w-full p-3 bg-[#1A1A1A] rounded-lg text-center border border-[#2A2A2A]">
            <p className="text-xs text-gray-400">Connected as</p>
            <p className="font-mono text-sm text-white break-all">{address}</p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="btn-primary w-full py-3"
          >
            Continue to Dashboard
          </button>
        </>
      ) : (
        <button
          onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
          className="btn-primary w-full py-3"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}