'use client'

import { useRouter } from 'next/navigation'
import { useWallet } from './WalletContext'

export default function ConnectWalletButton() {
  const { address, isCorrectChain, switchChain, targetChain } = useWallet()
  const router = useRouter()

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!isCorrectChain) {
        await switchChain()
      }
      // Removed automatic navigation - page will reload from WalletContext
    } catch (err) {
      console.error('Error connecting wallet:', err)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {address ? (
        <>
          <div className="w-full p-3 bg-[#1A1A1A] rounded-lg text-center border border-[#2A2A2A]">
            <p className="text-xs text-gray-400">Connected as</p>
            <p className="font-mono text-sm text-white break-all">{address}</p>
            {!isCorrectChain && (
              <p className="text-xs text-red-400 mt-1">
                Wrong network. Please switch to {targetChain.name}
              </p>
            )}
          </div>
          {isCorrectChain ? (
            <button
              onClick={() => router.push('/home')}
              className="btn-primary w-full py-3"
            >
              Continue to Dashboard
            </button>
          ) : (
            <button
              onClick={switchChain}
              className="btn-primary w-full py-3"
            >
              Switch to {targetChain.name}
            </button>
          )}
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="btn-primary w-full py-3"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}