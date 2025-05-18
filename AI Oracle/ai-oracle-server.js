require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

// 1. Setup Blockchain Connection
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
const contractABI = require('./MultiSigWalletABI.json').abi;
const contract = new ethers.Contract("0xA6E566b61A8596370C384C76d27485742F43e979", contractABI, wallet);

// 2. Simple AI Risk Assessment Function (Mock)
async function assessRisk(transactionData) {
  // In reality, you'd use a proper AI model here
  // This is a mock version that checks for:
  // - High value (>1 ETH) = +3 risk
  // - Unknown address = +2 risk
  // - Empty data = +1 risk
  
  let riskScore = 0;
  
  // Check transaction value
  if (transactionData.value.gt(ethers.utils.parseEther("1"))) {
    riskScore += 3;
    console.log("⚠️ High value transaction detected");
  }

  // Check if recipient is a contract
  try {
    const code = await provider.getCode(transactionData.to);
    if (code !== '0x') riskScore += 1; // Contract interaction
  } catch (err) {
    riskScore += 2; // Unknown address
    console.log("⚠️ Unknown recipient address");
  }

  // Check for empty calldata
  if (transactionData.data === '0x') {
    riskScore += 1;
    console.log("⚠️ Empty transaction data");
  }

  // Cap score at 10
  return Math.min(riskScore, 10);
}

// 3. Event Listener
async function setupEventListener() {
  console.log("🔮 AI Oracle Server Started...");
  
  contract.on("ProposalCreated", async (proposalId, proposer, to, value, data) => {
    try {
      console.log(`\n📝 New Proposal #${proposalId} detected:`);
      console.log(`From: ${proposer}`);
      console.log(`To: ${to}`);
      console.log(`Value: ${ethers.utils.formatEther(value)} ETH`);
      
      // Get full proposal details
      const proposal = await contract.proposals(proposalId);
      
      // Analyze risk (this is where real AI would go)
      const riskScore = await assessRisk({
        to: to,
        value: value,
        data: data
      });
      
      console.log(`🔄 Submitting risk score: ${riskScore}/10`);
      
      // Submit score to blockchain
      const tx = await contract.submitRiskScore(proposalId, riskScore);
      await tx.wait();
      
      console.log("✅ Score submitted successfully!");
    } catch (error) {
      console.error("❌ Error processing proposal:", error.message);
    }
  });
}

// 4. Start the server
setupEventListener();

// Handle shutdown
process.on('SIGINT', () => {
  console.log("\n🛑 Shutting down AI Oracle...");
  process.exit();
});