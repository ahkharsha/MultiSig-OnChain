// components/CreateProposal.tsx
'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

enum ActionType {
  Transaction = 'Transaction',
  AddOwner = 'Add Owner',
  RemoveOwner = 'Remove Owner',
  ChangeThreshold = 'Change Threshold',
}

export default function CreateProposal() {
  const [showDemo, setShowDemo] = useState(false)
  const { signer, address } = useWallet()
  const [action, setAction] = useState<ActionType>(ActionType.Transaction)
  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState('')
  const [manageAddr, setManageAddr] = useState('')
  const [newThreshold, setNewThreshold] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Block submissions in demo mode
    if (!isOwner && showDemo) {
      toast.error('Demo mode - submissions disabled', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      return
    }

    if (!isOwner) return // Double check

    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
    const iface = new ethers.Interface(contractABI.abi)

    let txTo = CONTRACT_ADDRESS
    let txValue: bigint = BigInt(0)
    let txData: string

    try {
      switch (action) {
        case ActionType.Transaction:
          if (!ethers.isAddress(to)) throw new Error('Invalid recipient address.')
          txTo = to
          txValue = ethers.parseEther(value || '0')
          txData = data.trim() === '' ? '0x' : data
          break
        case ActionType.AddOwner:
          if (!ethers.isAddress(manageAddr)) throw new Error('Invalid address to add.')
          txData = iface.encodeFunctionData('addOwner', [manageAddr])
          break
        case ActionType.RemoveOwner:
          if (!ethers.isAddress(manageAddr)) throw new Error('Invalid address to remove.')
          txData = iface.encodeFunctionData('removeOwner', [manageAddr])
          break
        case ActionType.ChangeThreshold:
          const t = Number(newThreshold)
          if (!t || t < 1) throw new Error('Threshold must be > 0.')
          txData = iface.encodeFunctionData('changeThreshold', [t])
          break
        default:
          throw new Error('Unknown action.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Validation error.', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      return
    }

    setLoading(true)
    try {
      const tx = await contract.propose(txTo, txValue, txData)
      await tx.wait()
      toast.success('Proposal submitted!', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      window.dispatchEvent(new Event('proposalCreated'))
      // Reset form
      setTo('')
      setValue('')
      setData('')
      setManageAddr('')
      setNewThreshold('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Submission failed.', {
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

  const isDemoMode = !isOwner && showDemo

  return (
    <div className={`card relative ${!isOwner && !showDemo ? 'opacity-80' : ''}`}>
      {!isOwner && !showDemo && (
        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center z-10">
          <div className="text-center p-4 bg-[#1A1A1A] rounded-lg border border-[#FF4320]/30">
            <h3 className="text-lg font-bold text-[#FF4320] mb-2">Owner Access Required</h3>
            <p className="text-gray-300 mb-4">You must be an owner to create proposals</p>
            <button
              onClick={() => setShowDemo(true)}
              className="btn-secondary text-sm px-4 py-2"
            >
              View Demo Functionality
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-white mb-4">
        {isDemoMode ? 'Demo Mode - ' : ''}Create New Proposal
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionType)}
            className="input"
            disabled={!isOwner && !isDemoMode}
          >
            {Object.values(ActionType).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {action === ActionType.Transaction && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Address</label>
              <input
                type="text"
                placeholder="0x..."
                className="input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                disabled={!isOwner && !isDemoMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">ETH Value</label>
              <input
                type="text"
                placeholder="0.1"
                className="input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                disabled={!isOwner && !isDemoMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Call Data (optional)</label>
              <input
                type="text"
                placeholder="0x..."
                className="input"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={!isOwner && !isDemoMode}
              />
            </div>
          </>
        )}

        {(action === ActionType.AddOwner || action === ActionType.RemoveOwner) && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {action === ActionType.AddOwner ? 'Address to Add' : 'Address to Remove'}
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input"
              value={manageAddr}
              onChange={(e) => setManageAddr(e.target.value)}
              required
              disabled={!isOwner && !isDemoMode}
            />
          </div>
        )}

        {action === ActionType.ChangeThreshold && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">New Threshold</label>
            <input
              type="number"
              min="1"
              placeholder="2"
              className="input"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              required
              disabled={!isOwner && !isDemoMode}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!isOwner && !isDemoMode)}
          className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${
            loading ? 'opacity-70' : 'hover:shadow-[#FF4320]/30'
          } ${!isOwner && !isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              {isDemoMode ? 'Try Demo Submission' : 'Submit Proposal'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}