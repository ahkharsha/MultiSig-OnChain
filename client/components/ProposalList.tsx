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
  requiredConfirmations: number
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

        const isNomination = to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && 
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
          isNomination,
          requiredConfirmations: isNomination 
            ? thresholdValue 
            : risk >= 5 ? thresholdValue + 2 : thresholdValue
        })
      }

      setProposals(all.reverse())
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch proposals', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
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
    
    const events = [
      'ProposalCreated',
      'ConfirmationAdded',
      'TransactionExecuted',
      'ProposalCancelled',
      'OwnerAdded',
      'OwnerRemoved',
      'ThresholdChanged'
    ]

    const listeners = events.map(event => {
      const handler = () => {
        fetchProposals()
        if (['TransactionExecuted', 'ProposalCancelled', 'OwnerAdded', 'OwnerRemoved', 'ThresholdChanged'].includes(event)) {
          window.dispatchEvent(new Event('walletUpdated'))
        }
      }
      contract.on(event, handler)
      return { event, handler }
    })

    return () => {
      listeners.forEach(({ event, handler }) => {
        contract.off(event, handler)
      })
    }
  }, [provider, fetchProposals])

  const doConfirm = async (id: number) => {
    if (!signer) return toast.error('Not connected', {
      style: {
        background: '#1A1A1A',
        color: '#FFFFFF',
        border: '1px solid #FF4320'
      }
    })

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.confirm(id)
      await tx.wait()
      toast.success('Confirmed!', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      fetchProposals()
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Confirm failed', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
    }
  }

  const doExecute = async (p: Proposal) => {
    if (!signer) return toast.error('Not connected', {
      style: {
        background: '#1A1A1A',
        color: '#FFFFFF',
        border: '1px solid #FF4320'
      }
    })

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.execute(p.id)
      await tx.wait()
      toast.success('Executed!', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      fetchProposals()
      window.dispatchEvent(new Event('walletUpdated'))
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Execute failed', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
    }
  }

  const doCancel = async (id: number) => {
    if (!signer) return toast.error('Not connected', {
      style: {
        background: '#1A1A1A',
        color: '#FFFFFF',
        border: '1px solid #FF4320'
      }
    })

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
      const tx = await contract.cancel(id)
      await tx.wait()
      toast.success('Cancelled!', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
      fetchProposals()
      window.dispatchEvent(new Event('walletUpdated'))
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || err.message || 'Cancel failed', {
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '1px solid #FF4320'
        }
      })
    }
  }

  const renderProposal = (p: Proposal) => {
    return (
      <div key={p.id} className="card group hover:border-[#FF4320]/50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-white">
              Proposal #{p.id}{' '}
              {p.isNomination && (
                <span className="inline-block bg-[#FF4320]/10 text-[#FF4320] text-xs px-2 py-1 rounded-full ml-2">
                  Nomination
                </span>
              )}
              {p.aiRiskScore >= 5 && (
                <span className="inline-block bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full ml-2">
                  High Risk
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Proposed by: <span className="font-mono text-white">{shortenAddress(p.proposer)}</span>
            </p>
          </div>
          
          <span className={`text-xs px-2 py-1 rounded-full ${
            p.cancelled ? 'bg-red-500/10 text-red-400' : 
            p.executed ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            {p.cancelled ? 'Cancelled' : p.executed ? 'Executed' : 'Pending'}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {p.isNomination ? (
            <p className="text-sm">
              <span className="text-gray-400">Nominee:</span>{' '}
              <span className="font-mono text-white">{shortenAddress('0x'+p.data.slice(-40))}</span>
            </p>
          ) : (
            <>
              <p className="text-sm">
                <span className="text-gray-400">Recipient:</span>{' '}
                <span className="font-mono text-white">{shortenAddress(p.to)}</span>
              </p>
              {p.value > BigInt(0) && (
                <p className="text-sm">
                  <span className="text-gray-400">Value:</span>{' '}
                  <span className="font-mono text-white">{ethers.formatEther(p.value)} ETH</span>
                </p>
              )}
            </>
          )}

          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Confirmations</span>
              <span className="font-medium text-white">
                {p.confirmations} / {p.requiredConfirmations}
              </span>
            </div>
            <div className="w-full bg-[#2A2A2A] rounded-full h-2">
              <div 
                className="bg-[#FF4320] h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (p.confirmations / p.requiredConfirmations) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {!p.confirmed && !p.executed && !p.cancelled && (
            <button 
              className="btn-secondary text-sm px-3 py-1.5"
              onClick={() => doConfirm(p.id)}
            >
              Confirm
            </button>
          )}
          {!p.executed && !p.cancelled && (
            <button 
              className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
              onClick={() => doExecute(p)}
              disabled={p.confirmations < p.requiredConfirmations}
            >
              Execute
            </button>
          )}
          {!p.executed && (
            <button 
              className="text-sm px-3 py-1.5 border border-gray-700 rounded-lg hover:bg-[#2A2A2A] transition"
              onClick={() => doCancel(p.id)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const active = proposals.filter(p => !p.executed && !p.cancelled)
  const completed = proposals.filter(p => p.executed)
  const cancelled = proposals.filter(p => p.cancelled)

  if (!address) {
    return (
      <div className="card text-center text-gray-400">
        Connect wallet to view proposals
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card text-center text-gray-400">
        Loading proposals...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-3">Active Proposals</h2>
        {active.length === 0 ? (
          <div className="card text-center text-gray-400">
            No active proposals
          </div>
        ) : (
          <div className="grid gap-4">
            {active.map(renderProposal)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-3">Completed Proposals</h2>
        {completed.length === 0 ? (
          <div className="card text-center text-gray-400">
            No completed proposals
          </div>
        ) : (
          <div className="grid gap-4">
            {completed.map(renderProposal)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-3">Cancelled Proposals</h2>
        {cancelled.length === 0 ? (
          <div className="card text-center text-gray-400">
            No cancelled proposals
          </div>
        ) : (
          <div className="grid gap-4">
            {cancelled.map(renderProposal)}
          </div>
        )}
      </div>
    </div>
  )
}