'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'

declare global {
    interface Window {
        ethereum?: any
    }
}

const WalletContext = createContext<any>(null)

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null)
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.Signer | null>(null)

    useEffect(() => {
        let connected = false

        const connect = async () => {
            if (!window.ethereum || connected) return
            connected = true

            const provider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })

            if (accounts.length === 0) {
                await window.ethereum.request({ method: 'eth_requestAccounts' })
            }
            const signer = await provider.getSigner()
            const address = await signer.getAddress()

            setProvider(provider)
            setSigner(signer)
            setAddress(address)
        }

        if (typeof window !== 'undefined') {
            connect()
        }
    }, [])


    return (
        <WalletContext.Provider value={{ address, provider, signer }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext)
