'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>MultiSig Wallet built by A Harsha Kumar for OnchAIn Hacker House selection task</p>
        <p className="mt-1">
          <a 
            href="https://github.com/ahkharsha/MultiSig-OnChain" 
            target="_blank"
            rel="noopener"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View source on GitHub
          </a>
        </p>
      </div>
    </footer>
  )
}