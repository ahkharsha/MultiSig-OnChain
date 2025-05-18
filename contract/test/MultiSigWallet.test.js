const { expect } = require("chai")
const { ethers } = require("hardhat")
const { time } = require("@nomicfoundation/hardhat-network-helpers")

// Import ABI from artifacts
const contractABI = require("../artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json").abi

describe("MultiSigWallet", function () {
  let MultiSigWallet
  let wallet
  let owner1, owner2, owner3, nonOwner, aiOracle

  beforeEach(async function () {
    [owner1, owner2, owner3, nonOwner, aiOracle] = await ethers.getSigners()
    
    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet")
    wallet = await MultiSigWallet.deploy(
      [owner1.address, owner2.address, owner3.address],
      2, // threshold
      aiOracle.address
    )
  })
  describe("Deployment", function () {
    it("Should set the right owners", async function () {
      const owners = await wallet.getOwners()
      expect(owners).to.have.lengthOf(3)
      expect(owners).to.include(owner1.address)
      expect(owners).to.include(owner2.address)
      expect(owners).to.include(owner3.address)
    })

    it("Should set the right threshold", async function () {
      expect(await wallet.getThreshold()).to.equal(2)
    })

    it("Should set the right AI oracle", async function () {
      expect(await wallet.aiOracle()).to.equal(aiOracle.address)
    })

    it("Should reject zero address owner", async function () {
      await expect(
        MultiSigWallet.deploy(
          [ethers.ZeroAddress, owner2.address, owner3.address],
          2,
          aiOracle.address
        )
      ).to.be.revertedWith("Zero address owner")
    })

    it("Should reject duplicate owners", async function () {
      await expect(
        MultiSigWallet.deploy(
          [owner1.address, owner1.address, owner3.address],
          2,
          aiOracle.address
        )
      ).to.be.revertedWith("Duplicate owner detected")
    })

    it("Should reject zero threshold", async function () {
      await expect(
        MultiSigWallet.deploy(
          [owner1.address, owner2.address, owner3.address],
          0,
          aiOracle.address
        )
      ).to.be.revertedWith("Threshold must be > 0")
    })

    it("Should reject threshold > owners count", async function () {
      await expect(
        MultiSigWallet.deploy(
          [owner1.address, owner2.address],
          3, // threshold > owners.length
          aiOracle.address
        )
      ).to.be.revertedWith("Threshold exceeds owner count")
    })
  })

  describe("Proposals", function () {
    it("Should allow owners to create proposals", async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      const proposal = await wallet.getProposal(0)
      expect(proposal.proposer).to.equal(owner1.address)
      expect(proposal.confirmations).to.equal(1) // Auto-confirmed
    })

    it("Should reject non-owners creating proposals", async function () {
      await expect(
        wallet.connect(nonOwner).propose(owner2.address, 100, "0x")
      ).to.be.revertedWith("Not an owner")
    })

    it("Should auto-confirm the proposer", async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      expect(await wallet.isConfirmed(0, owner1.address)).to.be.true
    })

    it("Should emit ProposalCreated event", async function () {
      await expect(wallet.connect(owner1).propose(owner2.address, 100, "0x"))
        .to.emit(wallet, "ProposalCreated")
        .withArgs(0, owner1.address, owner2.address, 100, "0x")
    })

    it("Should track confirmation count via getConfirmationCount", async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      expect(await wallet.getConfirmationCount(0)).to.equal(1)
      
      await wallet.connect(owner2).confirm(0)
      expect(await wallet.getConfirmationCount(0)).to.equal(2)
    })
  })

  describe("Confirmations", function () {
    beforeEach(async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
    })

    it("Should allow owners to confirm", async function () {
      await wallet.connect(owner2).confirm(0)
      expect(await wallet.isConfirmed(0, owner2.address)).to.be.true
    })

    it("Should reject non-owners confirming", async function () {
      await expect(
        wallet.connect(nonOwner).confirm(0)
      ).to.be.revertedWith("Not an owner")
    })

    it("Should reject confirming cancelled proposals", async function () {
      await wallet.connect(owner1).cancel(0)
      
      await expect(
        wallet.connect(owner2).confirm(0)
      ).to.be.revertedWith("Cancelled")
    })

    it("Should emit ConfirmationAdded event", async function () {
      await expect(wallet.connect(owner2).confirm(0))
        .to.emit(wallet, "ConfirmationAdded")
        .withArgs(0, owner2.address)
    })
  })

  describe("Execution", function () {
    beforeEach(async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      await wallet.connect(owner2).confirm(0)
    })

    it("Should reject non-owners executing", async function () {
      await expect(
        wallet.connect(nonOwner).execute(0)
      ).to.be.revertedWith("Not an owner")
    })
  })
  describe("Confirmations", function () {
    beforeEach(async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
    })

    it("Should allow owners to confirm", async function () {
      await wallet.connect(owner2).confirm(0)
      expect(await wallet.isConfirmed(0, owner2.address)).to.be.true
    })

    it("Should reject non-owners confirming", async function () {
      await expect(
        wallet.connect(nonOwner).confirm(0)
      ).to.be.revertedWith("Not an owner")
    })

    it("Should reject double confirmation", async function () {
      await expect(
        wallet.connect(owner1).confirm(0)
      ).to.be.revertedWith("Already confirmed")
    })

    it("Should reject confirming cancelled proposals", async function () {
      await wallet.connect(owner1).cancel(0)
      
      await expect(
        wallet.connect(owner2).confirm(0)
      ).to.be.revertedWith("Cancelled")
    })

    it("Should emit ConfirmationAdded event", async function () {
      await expect(wallet.connect(owner2).confirm(0))
        .to.emit(wallet, "ConfirmationAdded")
        .withArgs(0, owner2.address)
    })
  })

  describe("Execution", function () {
    beforeEach(async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      await wallet.connect(owner2).confirm(0)
      // Fast forward time to bypass cooldown
      await time.increase(31)
    })

    it("Should reject non-owners executing", async function () {
      await expect(
        wallet.connect(nonOwner).execute(0)
      ).to.be.revertedWith("Not an owner")
    })
  })

  describe("Cancellation", function () {
    beforeEach(async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
    })

    it("Should allow proposer to cancel", async function () {
      await wallet.connect(owner1).cancel(0)
      expect((await wallet.getProposal(0)).cancelled).to.be.true
    })

    it("Should allow other owners with threshold confirmations to cancel", async function () {
      await wallet.connect(owner2).confirm(0)
      await wallet.connect(owner2).cancel(0)
      expect((await wallet.getProposal(0)).cancelled).to.be.true
    })

    it("Should reject non-proposer/non-threshold cancellation", async function () {
      await expect(
        wallet.connect(owner3).cancel(0)
      ).to.be.revertedWith("Threshold not met for other-owner cancel")
    })

    it("Should emit ProposalCancelled event", async function () {
      await expect(wallet.connect(owner1).cancel(0))
        .to.emit(wallet, "ProposalCancelled")
        .withArgs(0)
    })
  })

  describe("Owner Management", function () {
    it("Should add owner via proposal", async function () {
      const iface = new ethers.Interface(contractABI)
      const callData = iface.encodeFunctionData("addOwner", [nonOwner.address])
      
      await wallet.connect(owner1).propose(wallet.target, 0, callData)
      await wallet.connect(owner2).confirm(0)
      // Fast forward time
      await time.increase(31)
      await wallet.execute(0)
      
      expect(await wallet.isOwner(nonOwner.address)).to.be.true
      expect(await wallet.getOwners()).to.include(nonOwner.address)
    })

    it("Should remove owner via proposal", async function () {
      const iface = new ethers.Interface(contractABI)
      const callData = iface.encodeFunctionData("removeOwner", [owner3.address])
      
      await wallet.connect(owner1).propose(wallet.target, 0, callData)
      await wallet.connect(owner2).confirm(0)
      // Fast forward time
      await time.increase(31)
      await wallet.execute(0)
      
      expect(await wallet.isOwner(owner3.address)).to.be.false
      expect(await wallet.getOwners()).not.to.include(owner3.address)
    })

    it("Should change threshold via proposal", async function () {
      const iface = new ethers.Interface(contractABI)
      const callData = iface.encodeFunctionData("changeThreshold", [1])
      
      await wallet.connect(owner1).propose(wallet.target, 0, callData)
      await wallet.connect(owner2).confirm(0)
      // Fast forward time
      await time.increase(31)
      await wallet.execute(0)
      
      expect(await wallet.getThreshold()).to.equal(1)
    })
  })
  describe("AI Integration", function () {
    it("Should allow AI oracle to submit risk scores", async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      await wallet.connect(aiOracle).submitRiskScore(0, 5)
      
      const proposal = await wallet.getProposal(0)
      expect(proposal.aiRiskScore).to.equal(5)
    })

    it("Should reject non-AI oracle submitting scores", async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      await expect(
        wallet.connect(owner1).submitRiskScore(0, 5)
      ).to.be.revertedWith("Not AI oracle")
    })

    it("Should reject invalid risk scores (>10)", async function () {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x")
      await expect(
        wallet.connect(aiOracle).submitRiskScore(0, 11)
      ).to.be.revertedWith("Score too high")
    })
  })

  describe("Nomination", function () {
    it("Should allow anyone to nominate new owners", async function () {
      await wallet.connect(nonOwner).nominateOwner(nonOwner.address)
      const proposal = await wallet.getProposal(0)
      
      expect(proposal.proposer).to.equal(nonOwner.address)
      expect(proposal.to).to.equal(wallet.target)
    })

    it("Should create nomination with 0 confirmations", async function () {
      await wallet.connect(nonOwner).nominateOwner(nonOwner.address)
      expect(await wallet.getConfirmationCount(0)).to.equal(0)
    })

    it("Should reject zero address nomination", async function () {
      await expect(
        wallet.connect(nonOwner).nominateOwner(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero nominee")
    })
  })
})