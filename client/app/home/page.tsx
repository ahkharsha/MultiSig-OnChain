'use client'

import InfoPanel from '../../components/InfoPanel'
import CreateProposal from '../../components/CreateProposal'
import ProposalList from '../../components/ProposalList'
import { useWallet } from '../../components/WalletContext'
import Header from '../../components/Header'

export default function HomePage() {
  const { address } = useWallet()

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <InfoPanel />
            <CreateProposal />
          </div>
          <div className="lg:col-span-2">
            <ProposalList />
          </div>
        </div>
      </main>
    </div>
  )
}