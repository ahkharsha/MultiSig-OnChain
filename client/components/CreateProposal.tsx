'use client'

import { useState } from 'react'
import { useWallet } from './WalletContext'
import { ethers } from 'ethers'
import contractABI from '../abis/MultiSigWallet.json'
import { CONTRACT_ADDRESS } from '../constants/contract'

export default function CreateProposal() {
    const { signer } = useWallet()
    const [to, setTo] = useState('')
    const [value, setValue] = useState('')
    const [data, setData] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (!signer) return
        setLoading(true)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer)
        try {
            const tx = await contract.propose(to, ethers.parseEther(value), data || '0x')
            await tx.wait()
            alert("Proposal submitted!")
        } catch (err: any) {
            console.error(err)
            alert(err.message)
        }

        alert('Proposal submitted!')
        setTo('')
        setValue('')
        setData('')
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Create Proposal</h2>
            <input type="text" placeholder="Recipient Address" className="input" value={to} onChange={(e) => setTo(e.target.value)} required />
            <input type="number" placeholder="ETH Value" className="input" value={value} onChange={(e) => setValue(e.target.value)} required />
            <input type="text" placeholder="Call data (optional)" className="input" value={data} onChange={(e) => setData(e.target.value)} />
            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    )
}
