'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'
import { FiUserPlus, FiArrowRight, FiAlertTriangle } from 'react-icons/fi'

export default function NominateSelf() {
  const { signer, address } = useWallet()
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isPulsing, setIsPulsing] = useState(true)

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
    
    // Pulsing animation for 5 seconds
    const timer = setTimeout(() => setIsPulsing(false), 5000)
    return () => clearTimeout(timer)
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
    <div className="bg-gradient-to-r from-[#FF4320]/10 to-[#FF914D]/10 border-2 border-[#FF4320]/30 p-6 rounded-xl shadow-lg relative overflow-hidden">
      {/* Updated attention-grabbing element position */}
      <div className={`absolute top-2 right-2 w-6 h-6 bg-[#FF4320] rounded-full flex items-center justify-center text-white ${
        isPulsing ? 'animate-ping' : ''
      }`}>
        <FiAlertTriangle className="text-xs" />
      </div>
      
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-[#FF4320]/10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#FF914D]/10 rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-[#FF4320]/20 rounded-lg">
            <FiUserPlus className="text-2xl text-[#FF4320]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Become an Owner!</h3>
            <p className="text-[#FF4320] font-medium">
              Join the multisig wallet now!
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            You need to be approved by existing owners to participate in governance.
          </p>
          <button
            onClick={handleNominate}
            disabled={loading}
            className={`btn-primary w-full flex items-center justify-center gap-2 group ${
              loading ? 'opacity-70' : 'hover:scale-[1.02] transform transition-transform'
            }`}
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <span className="font-bold">Nominate Yourself Now</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Requires approval from existing owners
          </p>
        </div>
      </div>
    </div>
  )
}