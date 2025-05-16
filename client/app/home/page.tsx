'use client'

import InfoPanel from '../../components/InfoPanel'
import CreateProposal from '../../components/CreateProposal'
import ProposalList from '../../components/ProposalList'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-indigo-700">MultiSig Wallet Dashboard</h1>
      <div className="max-w-4xl mx-auto space-y-6">
        <InfoPanel />
        <CreateProposal />
        <ProposalList />
      </div>
    </main>
  )
}
