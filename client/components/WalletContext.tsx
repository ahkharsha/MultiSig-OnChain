'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { DEFAULT_CHAIN } from '../constants/chain'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletContextType {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  chainId: number | null
  chainName: string | null
  targetChain: typeof DEFAULT_CHAIN
  switchChain: () => Promise<void>
  isCorrectChain: boolean
}

const WalletContext = createContext<WalletContextType | null>(null)

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [chainName, setChainName] = useState<string | null>(null)
  
  const targetChain = DEFAULT_CHAIN
  const isCorrectChain = chainId === targetChain.id

  // Force refresh the page when chain or account changes
  const handleChainOrAccountChange = () => {
    window.location.reload()
  }

  const switchChain = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChain.id.toString(16)}` }],
      })
      // DON'T navigate automatically - let the reload handler take care of it
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChain.id.toString(16)}`,
                chainName: targetChain.name,
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [targetChain.rpcUrl],
                blockExplorerUrls: [targetChain.explorerUrl],
              },
            ],
          })
        } catch (addError) {
          console.error('Error adding chain:', addError)
          toast.error('Failed to add network', {
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid #FF4320'
            }
          })
        }
      } else {
        console.error('Error switching chain:', switchError)
        toast.error('Failed to switch network', {
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #FF4320'
          }
        })
      }
    }
  }

  const connect = async () => {
    if (!window.ethereum) return

    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    // Get current chain info
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
    const chainId = parseInt(chainIdHex, 16)
    setChainId(chainId)
    
    try {
      const chainName = await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: chainIdHex }]
      }).then(() => null, () => null) || `Chain ${chainId}`
      setChainName(chainName)
    } catch {
      setChainName(`Chain ${chainId}`)
    }

    // Get accounts if already connected
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (accounts.length > 0) {
      const signer = await provider.getSigner()
      setSigner(signer)
      setAddress(accounts[0])
    }

    // Set up event listeners
    window.ethereum.on('accountsChanged', handleChainOrAccountChange)
    window.ethereum.on('chainChanged', handleChainOrAccountChange)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      connect()
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleChainOrAccountChange)
        window.ethereum.removeListener('chainChanged', handleChainOrAccountChange)
      }
    }
  }, [])

  return (
    <WalletContext.Provider value={{ 
      address, 
      provider, 
      signer, 
      chainId,
      chainName,
      targetChain,
      switchChain,
      isCorrectChain
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}