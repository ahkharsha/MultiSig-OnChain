'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

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
}

export default function ProposalList() {
  const { provider, signer, address } = useWallet()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!provider || !address) return

    const fetchProposals = async () => {
      setLoading(true)
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          provider
        )
        const countBN: bigint = await contract.getProposalCount()
        const count = Number(countBN)

        const temp: Proposal[] = []
        for (let i = 0; i < count; i++) {
          const [
            proposer,
            to,
            value,
            data,
            confirmationsBN,
            executed,
            cancelled,
            aiRiskScoreBN,
          ]: [
            string,
            string,
            bigint,
            string,
            bigint,
            boolean,
            boolean,
            number
          ] = await contract.getProposal(i)

          const confirmed: boolean = await contract.isConfirmed(i, address)

          temp.push({
            id: i,
            proposer,
            to,
            value,
            data,
            confirmations: Number(confirmationsBN),
            executed,
            cancelled,
            aiRiskScore: Number(aiRiskScoreBN),
            confirmed,
          })
        }
        setProposals(temp)
      } catch (err: any) {
        console.error('Fetch proposals failed', err)
        toast.error('Could not load proposals.')
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [provider, address])

  const doConfirm = async (id: number) => {
    if (!signer) {
      toast.error('Connect wallet to confirm.')
      return
    }
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      )
      const tx = await contract.confirm(id)
      await tx.wait()
      toast.success('Proposal confirmed!')
      // refresh
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, confirmed: true } : p))
      )
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || 'Confirm failed.')
    }
  }

  const doExecute = async (id: number) => {
    if (!signer) {
      toast.error('Connect wallet to execute.')
      return
    }
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      )
      const tx = await contract.execute(id)
      await tx.wait()
      toast.success('Proposal executed!')
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, executed: true } : p))
      )
    } catch (err: any) {
      console.error(err)
      toast.error(err.reason || 'Execute failed.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        Loading proposals…
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">Proposals</h2>
      {proposals.length === 0 ? (
        <p className="text-gray-500">No proposals yet.</p>
      ) : (
        proposals.map((p) => (
          <div key={p.id} className="border-b pb-4">
            <p>
              <strong>ID:</strong> {p.id}
            </p>
            <p>
              <strong>To:</strong> {p.to}
            </p>
            <p>
              <strong>Value:</strong>{' '}
              {p.value ? ethers.formatEther(p.value) + ' ETH' : '0 ETH'}
            </p>
            <p>
              <strong>Calldata:</strong> {p.data}
            </p>
            <p>
              <strong>Risk Score:</strong> {p.aiRiskScore}
            </p>
            <p>
              <strong>Executed:</strong> {p.executed ? '✅' : '❌'}
            </p>
            <p>
              <strong>Confirmed:</strong> {p.confirmed ? '✅' : '❌'}
            </p>

            {!p.executed && (
              <div className="mt-2 flex gap-2">
                {!p.confirmed && (
                  <button
                    onClick={() => doConfirm(p.id)}
                    className="btn-secondary"
                  >
                    Confirm
                  </button>
                )}
                <button
                  onClick={() => doExecute(p.id)}
                  className="btn-primary"
                >
                  Execute
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
