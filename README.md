# 🛡️ MultiSig Wallet dApp - Built for OnChain Island 🏝️ Selection Task

[![Deployment Status](https://img.shields.io/badge/Deployment-Live-brightgreen)](https://multisig-task-onchain.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/ahkharsha/MultiSig-OnChain)
[![LinkedIn](https://img.shields.io/badge/Connect-LinkedIn-blue)](https://www.linkedin.com/in/harsha-kumar-a-271a76203/)

<img src="https://github.com/user-attachments/assets/f0f1b147-7476-4650-a324-2f27119e71e8" alt="logo-white" width="175"/>

A Minimal Viable Guardian  
Secure multi-signature wallet dApp built for granny-friendly on-chain governance  
"Because even Granny deserves secure DeFi"

---

## 🚀 Quick Links

- **Live Demo**: <a href="https://multisig-task-onchain.vercel.app" target="_blank" rel="noopener noreferrer">https://multisig-task-onchain.vercel.app</a>  
- **Contract**: <a href="https://sepolia.etherscan.io/address/0xA6E566b61A8596370C384C76d27485742F43e979" target="_blank" rel="noopener noreferrer">0xA6E566b61A8596370C384C76d27485742F43e979</a> (Sepolia Testnet)
- **GitHub Repo**: <a href="https://github.com/ahkharsha/MultiSig-OnChain" target="_blank" rel="noopener noreferrer">https://github.com/ahkharsha/MultiSig-OnChain</a>

---

## 🎥 Demo Video

<a href="http://youtu.be/pe2unzAxV0M" target="_blank" rel="noopener noreferrer">
  <img src="https://img.youtube.com/vi/pe2unzAxV0M/0.jpg" alt="Watch Demo"/>
</a>

---

## 🖼️ Screenshots

<table>
  <tr>
    <td align="center">
      <strong>🔐 Auth & Landing Page</strong><br/>
      <img src="https://github.com/user-attachments/assets/264172c3-67cd-4eaf-94c7-840974b2b148" alt="Auth Page" width="400"/>
    </td>
    <td align="center">
      <strong>🙋‍♂️ New User Nomination + Demo Form</strong><br/>
      <img src="https://github.com/user-attachments/assets/0b30bddf-333c-45eb-bc8d-e104bcfac668" alt="Nominate Page" width="400"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>👑 Owner UI + Proposal</strong><br/>
      <img src="https://github.com/user-attachments/assets/783db2fa-9a8b-40e5-af97-1449741754af" alt="Owner UI" width="400"/>
    </td>
    <td align="center">
      <strong>📜 Proposal List (Active)</strong><br/>
      <img src="https://github.com/user-attachments/assets/f73adcb0-0831-48c6-8f6f-0180b8bf0653" alt="Proposal List" width="400"/>
    </td>
  </tr>
</table>

---

### 🧪 Hardhat Test Coverage

<p align="center">
  <strong>✅ 36/36 Test Cases Passed</strong><br/>
  <img src="https://github.com/user-attachments/assets/01e4a427-b1ad-4cef-b56b-f39f84b87942" alt="Hardhat Tests Passed" width="600"/>
</p>

---

## ✅ Challenge Completion Checklist

### 🔹 Core Requirements & Features

1. ✅ Initialization  
   - Constructor takes address[] initialOwners and uint256 _threshold  
   - Validates threshold range, checks for duplicates and zero addresses  

2. ✅ Transaction Proposal  
   - Only owners can propose  
   - Stores to, value, data  
   - Auto-confirmation by proposer  
   - Emits ProposalCreated  

3. ✅ Transaction Confirmation  
   - Owners can confirm if not already confirmed  
   - Emits ConfirmationAdded  

4. ✅ Transaction Execution  
   - Requires threshold confirmations  
   - Handles execution using call  
   - Emits TransactionExecuted  

5. ✅ View Functions  
   - getOwners(), getThreshold(), getProposal(), isConfirmed()

---

### ✨ Bonus Features & AI Integration

1. ✅ Owner Management via Governance

   * addOwner(address) & removeOwner(address)
   * Called only via proposals and on-chain execution flow

2. ✅ Proposal Revocation / Cancellation

   * Proposer can cancel instantly
   * Other owners can cancel via M-of-N confirmations

3. ✅ AI-Powered Transaction Risk Assessment

   * uint8 aiRiskScore added to Proposal struct
   * submitTransactionRiskScore(uint256 id, uint8 score) callable by only aiOracle
   * If risk score ≥ 5, requires (threshold + 2) confirmations to execute

---

### 🧪 Unit Testing & Evaluation Readiness

* ✅ Written and passing 36/36 unit tests using Hardhat
* ✅ Tests cover: proposal creation, confirmation, execution, high-risk enforcement, AI submission
* ✅ Contract follows gas-efficient patterns and proper access modifiers

---

🏁 All challenge requirements met and verified on-chain.

---

## 👵 Granny-Approved Features

Foolproof Security

* No single point of failure
* Clear confirmation requirements
* Visual risk indicators

Simple Workflow

1. Connect wallet
2. Nominate yourself (if new)
3. Create proposals
4. Confirm others' proposals
5. Execute when ready

Transparent Tracking

* Live proposal status
* Owner confirmation counts
* Execution history

---

## 🧑💻 Local Setup

1. Clone Repository
   git clone [https://github.com/ahkharsha/MultiSig-OnChain.git](https://github.com/ahkharsha/MultiSig-OnChain.git)

2. Install Dependencies
   cd MultiSig-OnChain/client
   npm install

3. Run Development Server
   npm run dev

4. Access
   Open [http://localhost:3000](http://localhost:3000) in browser

---

## 👨‍👩‍👧 Team CryptoVenture Innovators

| Role             | Member            | Contribution           |
| ---------------- | ----------------- | ---------------------- |
| Team Lead        | A Harsha Kumar    | Smart Contracts & Web3 |
| UI Development   | Harisankar R Nair | Frontend Development   |
| Solutions Expert | Reeve C Jack      | Proposal Logic         |
| UX Translator    | Duane             | Granny-Friendly Design |

---

## 📜 License

[MIT Licensed](https://github.com/ahkharsha/MultiSig-OnChain/blob/main/LICENSE) - Because Grannys believe in sharing (with proper permission!)  

---

🏝️ Built for OnChain Island with ❤️
"Let's bring Grannys OnChain"
