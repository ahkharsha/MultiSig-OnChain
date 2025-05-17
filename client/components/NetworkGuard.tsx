// components/NetworkGuard.tsx
'use client'

import { useWallet } from './WalletContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { address, isCorrectChain, switchChain, targetChain } = useWallet()
  const [showPrompt, setShowPrompt] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (address && !isCorrectChain) {
      setShowPrompt(true)
    } else {
      setShowPrompt(false)
    }
  }, [address, isCorrectChain])

  const handleSwitch = async () => {
    try {
      await switchChain()
      setShowPrompt(false)
    } catch (err) {
      console.error('Failed to switch network:', err)
      toast.error('Failed to switch network', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
    }
  }

  if (showPrompt) {
    return (
      <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-xl p-8 text-center mx-auto my-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#FF4320]">Wrong Network</h2>
        <p className="text-gray-400 mb-6">
          Please switch to {targetChain.name} to continue
        </p>
        <button
          onClick={handleSwitch}
          className="btn-primary w-full py-3 mb-4"
        >
          Switch to {targetChain.name}
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-[#FF4320] hover:underline"
        >
          Go back
        </button>
      </div>
    )
  }

  return <>{children}</>
}