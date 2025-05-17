'use client'
import { FiGithub } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] border-t border-[#2A2A2A] py-4 sticky bottom-0">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-300 text-sm mb-3">
          MultiSig Wallet built by A Harsha Kumar and Team for OnchAIn Hacker House selection task
        </p>
        
        <a
          href="https://github.com/ahkharsha/MultiSig-OnChain"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm border border-[#FF4320] text-[#FF4320] rounded-md hover:bg-[#FF4320]/10 transition-colors duration-200"
        >
          <FiGithub className="mr-2" />
          View on GitHub
        </a>
      </div>
    </footer>
  )
}