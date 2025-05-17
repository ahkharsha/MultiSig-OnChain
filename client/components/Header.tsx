'use client'

import { useWallet } from './WalletContext'
import Link from 'next/link'

export default function Header() {
  const { address } = useWallet()

  return (
    <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/home" className="text-2xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4320] to-[#FF914D]">
            MultiSig
          </span>
        </Link>
        
        {address && (
          <div className="hidden sm:flex items-center space-x-4">
            <div className="px-3 py-1.5 bg-[#2A2A2A] rounded-lg text-sm">
              <span className="text-gray-400">Connected: </span>
              <span className="font-mono text-white">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}