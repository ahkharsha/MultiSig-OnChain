# 🛡️ MultiSig Wallet dApp - Built for OnChain Island 🏝️ Selection Task

**A Minimal Viable Guardian**  
Secure multi-signature wallet dApp built for granny-friendly on-chain governance  
*"Because even Granny deserves secure DeFi"*  

---

## 🚀 Quick Links  

- **Live Demo**: [multisig-task-onchain.vercel.app](https://multisig-task-onchain.vercel.app)  
- **Contract**: [0x031DF4FD51003C921EEACcEFff2C8362e181f881](https://sepolia.etherscan.io/address/0x031DF4FD51003C921EEACcEFff2C8362e181f881) (Ethereum Sepolia)  
- **GitHub Repo**: [github.com/ahkharsha/MultiSig-OnChain](https://github.com/ahkharsha/MultiSig-OnChain)  

---

## 🎥 Demo Video

[![Watch Demo](https://img.youtube.com/vi/d5PpnElKWUU/0.jpg)](http://youtube.com/watch?v=d5PpnElKWUU)

---

## ✅ Challenge Completion Checklist

### 🔹 Core Requirements & Features

1. ✅ Initialization  
   - Contract uses constructor with address[] initialOwners and uint256 _threshold  
   - Validates threshold range, ensures no duplicate/zero addresses  

2. ✅ Transaction Proposal  
   - Only registered owners can propose  
   - Stores proposal details with `to`, `value`, `data`  
   - Proposer auto-confirms their own proposal  
   - Emits ProposalCreated event  

3. ✅ Transaction Confirmation  
   - Only owners can confirm  
   - Proposal must be active & not yet confirmed by caller  
   - Emits ConfirmationAdded event  

4. ✅ Transaction Execution  
   - Requires M-of-N confirmations  
   - Executes `to.call{value: val}(data)`  
   - Emits TransactionExecuted event  

5. ✅ View Functions  
   - getOwners()  
   - getThreshold()  
   - getProposal(uint256)  
   - isConfirmed(uint256, address)  
   - (confirmation count is included in getProposal return struct)

---

### ✨ Bonus Features & AI Integration

1. ✅ Owner Management via Governance  
   - addOwner(address) & removeOwner(address)  
   - Called only via proposals and on-chain execution flow  
   - No direct access from external callers  

2. ✅ Proposal Revocation / Cancellation  
   - Proposer can cancel instantly  
   - Other owners can cancel via M-of-N confirmations  

3. ✅ AI-Powered Transaction Risk Assessment  
   - `uint8 aiRiskScore` added to Proposal struct  
   - submitTransactionRiskScore(uint256 id, uint8 score) callable by only aiOracle  
   - If risk score ≥ 5, requires (threshold + 2) confirmations to execute  

---

### 🧪 Unit Testing & Evaluation Readiness

- ✅ Written and passing unit tests using Hardhat
- ✅ Tests cover: proposal creation, confirmation, execution, high-risk enforcement, AI submission
- ✅ Contract follows gas-efficient patterns and proper access modifiers

---

🏁 All challenge requirements met and verified on-chain.

---

## 👵 Granny-Approved Features

**Foolproof Security**
- No single point of failure
- Clear confirmation requirements
- Visual risk indicators

**Simple Workflow**
1. Connect wallet
2. Nominate yourself (if new)
3. Create proposals
4. Confirm others' proposals
5. Execute when ready

**Transparent Tracking**
- Live proposal status
- Owner confirmation counts
- Execution history

---

## 🧑💻 Local Setup  

1. **Clone Repository**  
   `git clone https://github.com/ahkharsha/MultiSig-OnChain.git`  

2. **Install Dependencies**  
   ```bash
   cd MultiSig-OnChain/client
   npm install
   ```

3. **Run Development Server**  
   ```bash
   npm run dev
   ```

4. **Access**  
   Open `http://localhost:3000` in browser  

---

## Team CryptoVenture Innovators

| Role | Member | Contribution |  
|------|--------|--------------|  
| **Team Lead** | A Harsha Kumar | Smart Contracts & Web3 |  
| **UI Development** | Harisankar R Nair | Frontend Development |  
| **Solutions Expert** | Reeve C Jack | Proposal Logic |  
| **UX Translator** | Duane | Granny-Friendly Design |  

---

## 📜 License  

[MIT Licensed](https://github.com/ahkharsha/MultiSig-OnChain/blob/main/LICENSE) - Because Grannys believe in sharing (with proper permission!)  

---

🏝️ Built for **OnChain Island** with ❤️  
*"Let's bring Grannys OnChain"*  