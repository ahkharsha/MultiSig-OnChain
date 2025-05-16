'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

export default function NominateSelf() {
  const { signer, address } = useWallet()
  const [loading, setLoading] = useState(false)

  const handleNominate = async () => {
    if (!signer || !address) {
      toast.error('Connect your wallet first.')
      return
    }

    try {
      setLoading(true)
      // Encode addOwner(address) calldata
      const iface = new ethers.Interface(contractABI.abi)
      const data = iface.encodeFunctionData('addOwner', [address])

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.propose(CONTRACT_ADDRESS, 0, data)
      await tx.wait()

      toast.success('Nomination proposal submitted!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Nomination failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
      <p className="text-yellow-800 mb-2">
        You are not an owner yet. Nominate yourself to join the multisig!
      </p>
      <button
        onClick={handleNominate}
        disabled={loading}
        className={`px-4 py-2 rounded-md font-medium transition ${
          loading
            ? 'bg-yellow-300 text-yellow-700 cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-yellow-500 text-white'
        }`}
      >
        {loading ? 'Submitting...' : 'Nominate Yourself'}
      </button>
    </div>
  )
}
