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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.nominateOwner(address)
      await tx.wait()
      toast.success('Nomination submitted!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Nomination failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#FF4320]/10 border border-[#FF4320]/20 p-4 rounded-lg">
      <p className="text-[#FF4320] mb-3">
        You are not an owner yet. Nominate yourself to join the multisig!
      </p>
      <button
        onClick={handleNominate}
        disabled={loading}
        className={`btn-secondary w-full ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? 'Submitting...' : 'Nominate Yourself'}
      </button>
    </div>
  )
}