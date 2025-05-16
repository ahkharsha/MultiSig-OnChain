'use client'

import { useEffect, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

type RawProposal = [
  string,  // proposer
  string,  // to
  bigint,  // value
  string,  // data
  bigint,  // confirmations
  boolean, // executed
  boolean, // cancelled
  number   // aiRiskScore
]

type Proposal = {
  id: number
  proposer: string
  to: string
  value: bigint
  data: string
  confirmations: number
  executed: boolean
  cancelled: boolean
  aiRiskScore: number
  confirmed: boolean
  isNomination: boolean
}

export default function ProposalList() {
  const { provider, signer, address } = useWallet()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [threshold, setThreshold] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchProposals = useCallback(async () => {
    if (!provider || !address) return
    setLoading(true)

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider)
      const iface = new ethers.Interface(contractABI.abi)

      const total = Number(await contract.getProposalCount())
      const thresholdValue = Number(await contract.threshold())
      setThreshold(thresholdValue)

      const addOwnerSig = iface.getFunction('addOwner(address)')!.selector

      const all: Proposal[] = []

      for (let i = 0; i < total; i++) {
        const raw = (await contract.getProposal(i)) as RawProposal
        const confirmed = await contract.isConfirmed(i, address)
        const [proposer, to, value, data, confs, exec, canc, risk] = raw

        const isNomination =
          to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
          data.startsWith(addOwnerSig)

        all.push({
          id: i,
          proposer,
          to,
          value,
          data,
          confirmations: Number(confs),
          executed: exec,
          cancelled: canc,
          aiRiskScore: risk,
          confirmed,
          isNomination
        })
      }

      setProposals(all.reverse())
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch proposals.')
    } finally {
      setLoading(false)
    }
  }, [provider, address])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  useEffect(() => {
    if (!provider) return

    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider)

    const update = () => fetchProposals()
    window.addEventListener('proposalCreated', update)
    window.addEventListener('walletUpdated', update)

    contract.on('ProposalCreated', update)
    contract.on('ConfirmationAdded', update)
    contract.on('TransactionExecuted', () => {
      update()
      window.dispatchEvent(new Event('walletUpdated'))
    })
    contract.on('ProposalCancelled', () => {
      update()
      window.dispatchEvent(new Event('walletUpdated'))
    })

    return () => {
      window.removeEventListener('proposalCreated', update)
      window.removeEventListener('walletUpdated', update)
      contract.removeAllListeners('ProposalCreated')
      contract.removeAllListeners('ConfirmationAdded')
      contract.removeAllListeners('TransactionExecuted')
      contract.removeAllListeners('ProposalCancelled')
    }
  }, [provider, fetchProposals])

  const doConfirm = async (id: number) => {
    if (!signer) return toast.error('Not connected')

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.confirm(id)
      await tx.wait()
      toast.success('Confirmed!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Confirm failed.')
    }
  }

  const doExecute = async (p: Proposal) => {
    if (!signer) return toast.error('Not connected')

    const required = p.aiRiskScore >= 5 ? threshold + 2 : threshold
    if (p.confirmations < required) {
      toast.error(`Need ${required} confirmations (${p.confirmations}/${required})`)
      return
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.execute(p.id)
      await tx.wait()
      toast.success('Executed!')
      window.dispatchEvent(new Event('walletUpdated'))
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Execute failed.')
    }
  }

  const doCancel = async (id: number) => {
    if (!signer) return toast.error('Not connected')

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.cancel(id)
      await tx.wait()
      toast.success('Cancelled!')
      window.dispatchEvent(new Event('walletUpdated'))
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Cancel failed.')
    }
  }

  const renderProposal = (p: Proposal) => {
    const required = p.aiRiskScore >= 5 ? threshold + 2 : threshold

    return (
      <div key={p.id} className="border p-4 rounded-md bg-white shadow space-y-1">
        <p>
          <strong>ID:</strong> {p.id}{' '}
          {p.isNomination && <span className="italic text-blue-600">(Nomination)</span>}
          {p.aiRiskScore >= 5 && (
            <span className="ml-2 text-sm font-semibold text-red-600">High Risk</span>
          )}
        </p>
        <p><strong>Proposer:</strong> {p.proposer}</p>

        {p.isNomination ? (
          <p><strong>To Add:</strong> 0x{p.data.slice(-40)}</p>
        ) : (
          <p><strong>To:</strong> {p.to}</p>
        )}

        {p.value > BigInt(0) && (
          <p><strong>Value:</strong> {ethers.formatEther(p.value)} ETH</p>
        )}

        {!p.isNomination && p.data !== '0x' && (
          <p><strong>Calldata:</strong> {p.data}</p>
        )}

        <p>
          <strong>Confirmations:</strong> {p.confirmations} / {required}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          {p.cancelled ? '❌ Cancelled' : p.executed ? '✅ Executed' : '⏳ Pending'}
        </p>

        <div className="flex gap-2 mt-2">
          {!p.confirmed && !p.executed && !p.cancelled && (
            <button className="btn-secondary" onClick={() => doConfirm(p.id)}>Confirm</button>
          )}
          {!p.executed && !p.cancelled && (
            <button className="btn-primary" onClick={() => doExecute(p)}>Execute</button>
          )}
          {!p.executed && (
            <button className="btn-secondary" onClick={() => doCancel(p.id)}>Cancel</button>
          )}
        </div>
      </div>
    )
  }

  const active = proposals.filter(p => !p.executed && !p.cancelled)
  const completed = proposals.filter(p => p.executed)
  const cancelled = proposals.filter(p => p.cancelled)

  if (!address) {
    return (
      <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">
        Connect wallet to view proposals
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">
        Loading proposals…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Active Proposals</h2>
        {active.length === 0
          ? <p className="text-gray-500">No active proposals</p>
          : active.map(renderProposal)}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2 text-green-700">✅ Completed Proposals</h2>
        {completed.length === 0
          ? <p className="text-gray-500">None yet</p>
          : completed.map(renderProposal)}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2 text-red-600">❌ Cancelled Proposals</h2>
        {cancelled.length === 0
          ? <p className="text-gray-500">None</p>
          : cancelled.map(renderProposal)}
      </div>
    </div>
  )
}
