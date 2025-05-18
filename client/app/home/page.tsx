'use client'

import InfoPanel from '../../components/InfoPanel'
import CreateProposal from '../../components/CreateProposal'
import ProposalList from '../../components/ProposalList'
import { useWallet } from '../../components/WalletContext'

export default function HomePage() {
  const { address } = useWallet()

  return (
    <div className="flex flex-col h-full w-full">
      <main className="flex-1 overflow-auto w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* InfoPanel - Left Column (8/12 width) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-4">
                <InfoPanel />
              </div>
            </div>
            
            {/* CreateProposal - Right Column (4/12 width) */}
            <div id="create" className="lg:col-span-4">
              <div className="p-4">
                <CreateProposal />
              </div>
            </div>
            
            {/* ProposalList - Full Width (12/12) */}
            <div id="proposals" className="lg:col-span-12">
              <div className="p-4">
                <ProposalList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}