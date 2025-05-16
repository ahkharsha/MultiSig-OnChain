'use client'

import { useEffect, useState } from 'react'
import { useWallet } from './WalletContext'
import { ethers } from 'ethers'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

export default function ProposalList() {
  const { provider, signer, address } = useWallet()
  const [proposals, setProposals] = useState<any[]>([])

  useEffect(() => {
    if (!provider || !address) return
    const fetch = async () => {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider)
      const count = await contract.getProposalCount()
      const list = []
      for (let i = 0; i < count; i++) {
        const p = await contract.getProposal(i)
        const confirmed = await contract.isConfirmed(i, address)
        list.push({ id: i, ...p, confirmed })
      }
      setProposals(list)
    }
    fetch()
  }, [provider, address])

  const confirm = async (id: number) => {
    if (!signer) return
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
    const tx = await contract.confirm(id)
    await tx.wait()
    alert('Confirmed!')
  }

  const execute = async (id: number) => {
    if (!signer) return
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
    const tx = await contract.execute(id)
    await tx.wait()
    alert('Executed!')
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Proposals</h2>
      {proposals.length === 0 ? (
        <p className="text-gray-500 text-sm">No proposals yet</p>
      ) : (
        proposals.map((p) => (
          <div key={p.id} className="border-b py-3 text-sm">
            <p><strong>ID:</strong> {p.id}</p>
            <p><strong>To:</strong> {p.to}</p>
            <p><strong>Value:</strong> {p?.value ? ethers.formatEther(p.value) + ' ETH' : 'N/A'}</p>
            <p><strong>Risk Score:</strong> {p.aiRiskScore}</p>
            <p><strong>Executed:</strong> {p.executed ? '✅' : '❌'}</p>
            <p><strong>Confirmed:</strong> {p.confirmed ? '✅' : '❌'}</p>
            {!p.executed && (
              <div className="flex gap-2 mt-2">
                {!p.confirmed && (
                  <button onClick={() => confirm(p.id)} className="btn-secondary">
                    Confirm
                  </button>
                )}
                <button onClick={() => execute(p.id)} className="btn-primary">
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
