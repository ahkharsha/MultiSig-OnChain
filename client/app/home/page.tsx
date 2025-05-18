// app/home/page.tsx
'use client'

import InfoPanel from '../../components/InfoPanel'
import CreateProposal from '../../components/CreateProposal'
import ProposalList from '../../components/ProposalList'
import { useWallet } from '../../components/WalletContext'

export default function HomePage() {
  const { address } = useWallet()

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - InfoPanel */}
            <div className="md:col-span-1">
              <InfoPanel />
            </div>
            
            {/* Right Column - CreateProposal */}
            <div id="create" className="md:col-span-1">
              <CreateProposal />
            </div>
            
            {/* Full Width Proposal List */}
            <div id="proposals" className="md:col-span-2">
              <ProposalList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}