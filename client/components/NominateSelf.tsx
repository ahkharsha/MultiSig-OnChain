'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

export default function NominateSelf() {
  const { signer, address } = useWallet()
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const checkOwnerStatus = async () => {
      if (!address) return
      
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer || undefined)
        const ownerStatus = await contract.isOwner(address)
        setIsOwner(ownerStatus)
      } catch (err) {
        console.error("Error checking owner status:", err)
      }
    }

    checkOwnerStatus()
  }, [address, signer])

  const handleNominate = async () => {
    if (!signer || !address) {
      toast.error('Connect your wallet first.', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      return
    }

    try {
      setLoading(true)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.nominateOwner(address)
      await tx.wait()
      toast.success('Nomination submitted!', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Nomination failed.', {
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

  if (isOwner) return null

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