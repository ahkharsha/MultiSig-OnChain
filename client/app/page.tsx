'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Box, Button, Input, VStack, Heading, Text,
} from '@chakra-ui/react';
import abi from '../abis/MultiSigWallet.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export default function Page() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [wallet, setWallet] = useState<ethers.Contract>();
  const [owners, setOwners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(0);
  const [to, setTo] = useState<string>('');
  const [value, setValue] = useState<string>('0');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
      ;(async () => {
        await p.send('eth_requestAccounts', []);
        const signer = await p.getSigner();
        const c = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
        setWallet(c);
      })();
    }
  }, []);

  useEffect(() => {
    if (wallet) {
      wallet.getOwners().then((o: string[]) => setOwners(o));
      wallet.getThreshold().then((t: ethers.BigNumber) => setThreshold(t.toNumber()));
    }
  }, [wallet]);

  async function propose() {
    if (!wallet) return;
    const tx = await wallet.propose(to, ethers.utils.parseEther(value), '0x');
    await tx.wait();
    alert('Proposal submitted');
  }

  return (
    <VStack spacing={4} p={8}>
      <Heading>MultiSig Wallet</Heading>
      <Text>Owners: {owners.join(', ')}</Text>
      <Text>Threshold: {threshold}</Text>
      <Box w="100%" maxW="md">
        <Input placeholder="Recipient address" mb={2} value={to} onChange={e => setTo(e.target.value)} />
        <Input placeholder="ETH amount" mb={4} value={value} onChange={e => setValue(e.target.value)} />
        <Button w="full" colorScheme="blue" onClick={propose}>Propose Transaction</Button>
      </Box>
    </VStack>
  );
}