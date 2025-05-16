# 🛡️ MultiSig Wallet dApp

A fully on-chain, AI-aware, dynamic Multi-Signature Wallet built with ❤️ using Solidity, Next.js, Ethers.js, and Tailwind CSS.

> 🔐 Built for the OnChain Island Selection Task.
> ✨ Everything is on-chain. Dynamic. Clean. Fast. Smart.

---

## 🌐 Live Demo

🔗 [https://multisig-task-onchain.vercel.app](https://multisig-task-onchain.vercel.app)

📦 Contract Address:
[0x6A6D5dFFA62AE1423FaeD3effEd8F50aa190a129](https://sepolia.arbiscan.io/address/0x6A6D5dFFA62AE1423FaeD3effEd8F50aa190a129)

Network: Arbitrum Sepolia

---

## 📸 Preview

### 🧠 Dashboard

![Dashboard Preview](assets/dashboard-preview.png)

### 🔐 Connect Wallet

![Connect Wallet](assets/connect-wallet.png)

### 🧾 Create Proposal

![Create Proposal](assets/create-proposal.png)

### ✅ Confirm & Execute

![Confirm & Execute](assets/confirm-execute.png)

### ❌ Cancelled Proposals

![Cancelled Proposals](assets/cancelled.png)

---

## 🚀 Features

* 🔐 Multi-signature Wallet (M-of-N)
* 🧠 AI Risk Score integration
* 👤 Owner Nomination for new users
* 📜 Proposals for:

  * ETH Transfers
  * addOwner / removeOwner
  * changeThreshold
* ⛓️ On-chain Confirm / Execute / Cancel
* 🧠 High Risk Proposals (AI Score ≥ 5) → threshold + 2 confirmations
* ⚡ Real-time UI with:

  * Ethereum Event Listeners
  * Client-side Custom Events
* ✨ Beautiful responsive UI (Tailwind CSS)
* 🔔 Toast notifications for all actions

---

## 🏗️ Architecture

![Architecture Diagram](assets/architecture-diagram.png)

* Smart Contract: Solidity (0.8.x)
* Frontend: Next.js + App Router
* Ethereum Interaction: ethers.js
* Chain: Arbitrum Sepolia
* Libraries: Tailwind CSS, react-hot-toast

---

## 🧠 Smart Contract Overview

* Owners tracked via both array + mapping
* Proposals contain:

  * to address
  * value
  * calldata
  * executed/cancelled flags
  * confirmations
  * AI risk score
* AI Oracle address submits risk score
* All governance flows must go through:
  ➕ propose → ✅ confirm → 🛠️ execute

✅ Internal governance functions like addOwner/removeOwner have no onlyOwner — access controlled via proposal execution

---

## 📱 UI Walkthrough

* ✅ Connects to MetaMask
* 👀 Detects if connected user is an owner
* 🙋‍♂️ If not owner → Show “Nominate Yourself”
* 📜 Create Proposal:

  * ETH transfer
  * addOwner / removeOwner
  * changeThreshold
* 🗳️ Confirm proposals
* 🛠️ Execute when confirmations reached
* ❌ Cancel proposals
* ✅ Auto-grouped into Active, Completed, and Cancelled lists

---

## 📦 Run Locally

1. Clone the repo:

   git clone [https://github.com/ahkharsha/multisig-onchain.git](https://github.com/your-username/multisig-onchain.git)

2. Install dependencies:

   cd multisig-onchain
   cd client
   npm install

4. Start dev server:

   npm run dev

Update contract address and ABI in:

* /client/constants/contract.ts
* /client/abis/MultiSigWallet.json

---

## 💻 Tech Stack

* 🧠 Solidity
* ⚛️ React / Next.js App Router
* 🦄 ethers.js
* 🍞 react-hot-toast
* 🌐 Tailwind CSS
* 🧠 AI Oracle-ready integration

---

## 🧠 Team — Granny Lovers 3000 🧓🚀

| Name              | Role               | 
| ----------------- | ------------------ | 
| A Harsha Kumar    | Team Lead, Web3    |
| Harisankar R Nair | Web3               |
| Reeve C Jack      | Frontend Developer |
| Duane             | UI/UX & Frontend   |

---

## 📸 Image Assets to Add

Place these in the /assets folder:

* dashboard-preview\.png
* connect-wallet.png
* create-proposal.png
* confirm-execute.png
* cancelled.png
* architecture-diagram.png

---

## 📜 License

MIT

---

Made with ☕, ❤️, and sleepless nights
For OnChain Island 🏝️ by Granny Lovers 3000 🚀
