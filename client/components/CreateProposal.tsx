'use client'

import { useState } from 'react'
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
  const { signer } = useWallet()
  const [action, setAction] = useState<ActionType>(ActionType.Transaction)
  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState('')
  const [manageAddr, setManageAddr] = useState('')
  const [newThreshold, setNewThreshold] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer) {
      toast.error('Please connect your wallet.', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      return
    }

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

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-white mb-4">Create New Proposal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionType)}
            className="input"
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
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`btn-primary w-full py-3 ${loading ? 'opacity-70' : ''}`}
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
            'Submit Proposal'
          )}
        </button>
      </form>
    </div>
  )
}