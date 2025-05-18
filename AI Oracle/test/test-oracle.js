require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  // 1. Verify environment variables

  // 2. Setup provider
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
  
  // 3. Load ABI (verify path is correct)
  const ABI = require('../MultiSigWalletABI.json').abi;
  
  // 4. Create contract instance
  const contract = new ethers.Contract(
    "0xA6E566b61A8596370C384C76d27485742F43e979",
    ABI,
    provider
  );

  console.log("Oracle tester started. Watching for proposals...");

  async function checkLastProposal() {
    try {
      const count = await contract.getProposalCount();
      if (count > 0) {
        const lastProposal = await contract.proposals(count-1);
        console.log(`Last proposal risk score: ${lastProposal.aiRiskScore}`);
      } else {
        console.log("No proposals found");
      }
    } catch (err) {
      console.error("Error checking proposal:", err.message);
    }
  }

  // Check every 5 seconds
  setInterval(checkLastProposal, 5000);
}

main().catch(console.error);