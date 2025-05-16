'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

export default function CreateProposal() {
  const { signer } = useWallet()
  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer) {
      toast.error('Please connect your wallet.')
      return
    }

    if (!ethers.isAddress(to)) {
      toast.error('Invalid recipient address.')
      return
    }

    let ethValue: bigint
    try {
      ethValue = ethers.parseEther(value || '0')
    } catch {
      toast.error('Invalid ETH value.')
      return
    }

    setLoading(true)
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      )

      // if no calldata, pass '0x'
      const calldata = data.trim() === '' ? '0x' : data

      const tx = await contract.propose(to, ethValue, calldata)
      await tx.wait()
      toast.success('Proposal submitted!')
      setTo('')
      setValue('')
      setData('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">Create Proposal</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        className="input"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="ETH Value"
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Call data (optional)"
        className="input"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className={`btn-primary ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
