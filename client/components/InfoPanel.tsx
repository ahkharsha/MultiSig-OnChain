'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

export default function InfoPanel() {
  const { provider } = useWallet()
  const [owners, setOwners] = useState<string[]>([])
  const [threshold, setThreshold] = useState<number>(0)

  useEffect(() => {
    if (!provider) return
    const fetchInfo = async () => {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider)
      const _owners = await contract.getOwners()
      const _threshold = await contract.threshold()
      setOwners(_owners)
      setThreshold(Number(_threshold))
    }
    fetchInfo()
  }, [provider])

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Wallet Info</h2>
      <p className="text-sm text-gray-600 mb-1">Threshold: {threshold}</p>
      <ul className="list-disc text-sm text-gray-700 ml-6">
        {owners.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
    </div>
  )
}
