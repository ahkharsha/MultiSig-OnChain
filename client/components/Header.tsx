'use client'

import { useWallet } from './WalletContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { address, isCorrectChain, targetChain, chainId } = useWallet()
  const pathname = usePathname()

  const navLinks = [
    { name: 'Dashboard', href: '/home', show: true },
    { name: 'Create Proposal', href: '/home#create', show: address && isCorrectChain },
    { name: 'Active Proposals', href: '/home#proposals', show: address && isCorrectChain },
  ]

  // Chain display configuration
  const getChainName = (chainId: number | null) => {
    switch(chainId) {
      case 421614: return 'Arbitrum Sepolia'
      case 80002: return 'Polygon Amoy'
      case 1: return 'Ethereum'
      case 11155111: return 'Sepolia'
      default: return chainId ? `Chain ${chainId}` : 'Disconnected'
    }
  }

  return (
    <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href={address ? "/home" : "/"} className="text-2xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4320] to-[#FF914D]">
              MultiSig OnChain
            </span>
          </Link>

          {address && isCorrectChain && (
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                link.show && (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      pathname === link.href.split('#')[0]
                        ? 'text-[#FF4320]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </nav>
          )}
        </div>
        
        {address && (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`px-3 py-1.5 rounded-lg text-sm ${
                isCorrectChain 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                <span className="text-gray-400">Network: </span>
                <span className="font-medium">
                  {getChainName(chainId)}
                </span>
              </div>
            </div>
            
            <div className="px-3 py-1.5 bg-[#2A2A2A] rounded-lg text-sm">
              <span className="text-gray-400">Connected: </span>
              <span className="font-mono text-white">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation - Added chain info */}
      {address && (
        <div className="md:hidden border-t border-[#2A2A2A]">
          <div className="flex justify-between items-center px-4 py-2">
            <div className={`px-2 py-1 rounded text-xs ${
              isCorrectChain 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              Network: {getChainName(chainId)}
            </div>
            
            {isCorrectChain && (
              <nav className="flex space-x-4">
                {navLinks.map((link) => (
                  link.show && (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-xs font-medium transition-colors ${
                        pathname === link.href.split('#')[0]
                          ? 'text-[#FF4320]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </nav>
            )}
          </div>
        </div>
      )}
    </header>
  )
}