'use client'

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] border-t border-[#2A2A2A] py-6 sticky bottom-0">
      <div className="container mx-auto px-4 text-center text-sm">
        <p className="text-gray-400">
          MultiSig Wallet built by A Harsha Kumar for OnchAIn Hacker House selection task
        </p>
        <p className="mt-1">
          <a 
            href="https://github.com/ahkharsha/MultiSig-OnChain" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF4320] hover:underline"
          >
            View source on GitHub
          </a>
        </p>
      </div>
    </footer>
  )
}