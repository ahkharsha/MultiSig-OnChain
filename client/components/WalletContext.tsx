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
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                setAddress(null)
                setSigner(null)
            } else {
                setAddress(accounts[0])
            }
        }

        const connect = async () => {
            if (!window.ethereum) return

            const provider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })

            if (accounts.length > 0) {
                const signer = await provider.getSigner()
                setProvider(provider)
                setSigner(signer)
                setAddress(accounts[0])
            }

            window.ethereum.on('accountsChanged', handleAccountsChanged)
        }

        if (typeof window !== 'undefined') {
            connect()
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
            }
        }
    }, [])

    return (
        <WalletContext.Provider value={{ address, provider, signer }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext)