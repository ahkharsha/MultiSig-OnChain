// constants/chains.ts
export const SUPPORTED_CHAINS = {
  arbitrumSepolia: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io/'
  },
  polygonAmoy: {
    id: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
    explorerUrl: 'https://amoy.polygonscan.com/'
  },
  flowTestnet: {
    id: 545,
    name: 'Flow EVM Testnet',
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    explorerUrl: 'https://testnet.flowdiver.io/'
  }
} as const;

// Define your default chain here (ONLY CHANGE THIS LINE)
export const DEFAULT_CHAIN_NAME: keyof typeof SUPPORTED_CHAINS = 'arbitrumSepolia';

// Derived values
export const DEFAULT_CHAIN = SUPPORTED_CHAINS[DEFAULT_CHAIN_NAME];
export type ChainConfig = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];