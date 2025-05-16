'use client'

import { useRouter } from 'next/navigation'
import { useWallet } from './WalletContext'

export default function ConnectWalletButton() {
  const { address } = useWallet()
  const router = useRouter()

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {address ? (
        <>
          <p className="text-lg font-semibold">Connected: {address}</p>
          <button
            onClick={() => router.push('/home')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Continue to Dashboard
          </button>
        </>
      ) : (
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded animate-pulse cursor-not-allowed"
          disabled
        >
          Connecting...
        </button>
      )}
    </div>
  )
}
