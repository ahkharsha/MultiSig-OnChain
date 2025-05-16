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
      toast.error('Please connect your wallet.')
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
      toast.error(err.message || 'Validation error.')
      return
    }

    setLoading(true)
    try {
      const tx = await contract.propose(txTo, txValue, txData)
      await tx.wait()
      toast.success('Proposal submitted!')
      window.dispatchEvent(new Event('proposalCreated')) // trigger refresh
      setTo('')
      setValue('')
      setData('')
      setManageAddr('')
      setNewThreshold('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create Proposal</h2>
      <label className="block">
        <span className="font-medium">Action</span>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as ActionType)}
          className="input"
        >
          {Object.values(ActionType).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>

      {action === ActionType.Transaction && (
        <>
          <input type="text" placeholder="Recipient Address" className="input" value={to} onChange={(e) => setTo(e.target.value)} required />
          <input type="text" placeholder="ETH Value" className="input" value={value} onChange={(e) => setValue(e.target.value)} required />
          <input type="text" placeholder="Call data (hex, optional)" className="input" value={data} onChange={(e) => setData(e.target.value)} />
        </>
      )}

      {(action === ActionType.AddOwner || action === ActionType.RemoveOwner) && (
        <input
          type="text"
          placeholder={action === ActionType.AddOwner ? 'Address to add' : 'Address to remove'}
          className="input"
          value={manageAddr}
          onChange={(e) => setManageAddr(e.target.value)}
          required
        />
      )}

      {action === ActionType.ChangeThreshold && (
        <input
          type="number"
          min="1"
          placeholder="New Threshold"
          className="input"
          value={newThreshold}
          onChange={(e) => setNewThreshold(e.target.value)}
          required
        />
      )}

      <button type="submit" disabled={loading} className={`btn-primary ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
        {loading ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
