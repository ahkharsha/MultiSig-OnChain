'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'
import NominateSelf from './NominateSelf'

export default function InfoPanel() {
  const { provider, address } = useWallet()
  const [owners, setOwners] = useState<string[]>([])
  const [threshold, setThreshold] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = async () => {
    if (!provider) return

    try {
      setLoading(true)
      setError(null)

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        provider
      )

      const [_owners, _threshold] = await Promise.all([
        contract.getOwners(),
        contract.threshold()
      ])

      setOwners(_owners)
      setThreshold(Number(_threshold))
    } catch (err) {
      console.error(err)
      setError('Failed to fetch wallet info')
      toast.error('Could not load wallet info', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInfo()
  }, [provider])

  useEffect(() => {
    const handleUpdate = () => {
      fetchInfo()
    }

    window.addEventListener('walletUpdated', handleUpdate)

    let listener: ((blockNumber: number) => void) | undefined
    if (provider) {
      listener = () => {
        fetchInfo()
      }
      provider.on('block', listener)
    }

    return () => {
      window.removeEventListener('walletUpdated', handleUpdate)
      if (provider && listener) {
        provider.off('block', listener)
      }
    }
  }, [provider])

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#2A2A2A] rounded w-1/2"></div>
          <div className="h-4 bg-[#2A2A2A] rounded w-3/4"></div>
          <div className="h-4 bg-[#2A2A2A] rounded"></div>
          <div className="h-4 bg-[#2A2A2A] rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-md">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchInfo}
          className="mt-2 text-sm text-red-400 hover:text-red-300 font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold text-white">Wallet Configuration</h2>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">Threshold</h3>
        <p className="font-mono bg-[#2A2A2A] p-3 rounded-lg text-white">
          {threshold} out of {owners.length} required
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">Owners</h3>
        <ul className="space-y-2">
          {owners.map((owner) => (
            <li 
              key={owner} 
              className={`font-mono text-sm p-3 rounded-lg break-all ${
                owner === address ? 'bg-[#FF4320]/10 border border-[#FF4320]/20' : 'bg-[#2A2A2A]'
              }`}
            >
              {owner}
              {owner === address && (
                <span className="ml-2 text-xs bg-[#FF4320] text-black px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {address && !owners.includes(address) && (
        <div className="pt-2">
          <NominateSelf />
        </div>
      )}
    </div>
  )
}