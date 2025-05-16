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

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        provider
      )

      const _owners: string[] = await contract.getOwners()
      const _thresholdBigInt: bigint = await contract.threshold()
      const _thresholdNum = Number(_thresholdBigInt)

      setOwners(_owners)
      setThreshold(_thresholdNum)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch wallet info.')
      toast.error('Could not load wallet info.')
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
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        Loading wallet info…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-md">
        <p className="text-red-800 mb-2">{error}</p>
      </div>
    )
  }

  // If user is not in owners list, show nomination component
  if (address && !owners.includes(address)) {
    return <NominateSelf />
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Wallet Info</h2>
      <p className="text-gray-600 mb-1">
        <span className="font-medium">Threshold:</span> {threshold}
      </p>
      <p className="text-gray-600 font-medium">Owners:</p>
      <ul className="list-disc ml-5 space-y-1">
        {owners.map((o) => (
          <li key={o} className="text-gray-700 break-all">
            {o}
          </li>
        ))}
      </ul>
    </div>
  )
}
