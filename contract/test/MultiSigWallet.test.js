const { expect } = require("chai");
const { ethers } = require("hardhat");
const { dummyAddresses } = require("./helpers");

describe("MultiSigWallet", function () {
  let MultiSigWallet, wallet;
  let owner1, owner2, owner3, nonOwner, aiOracle;

  beforeEach(async () => {
    [owner1, owner2, owner3, nonOwner, aiOracle] = await ethers.getSigners();

    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    wallet = await MultiSigWallet.deploy(
      [owner1.address, owner2.address, owner3.address],
      2, // threshold
      aiOracle.address
    );
  });

  // Basic Tests
  describe("Deployment", () => {
    it("Should set correct owners and threshold", async () => {
      expect(await wallet.getThreshold()).to.equal(2);
      const owners = await wallet.getOwners();
      expect(owners).to.deep.equal([
        owner1.address,
        owner2.address,
        owner3.address,
      ]);
    });
  });

  // Proposal Lifecycle
  describe("Proposals", () => {
    let proposalId;

    beforeEach(async () => {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x");
      proposalId = 0;
    });

    it("Should auto-confirm proposer", async () => {
      expect(await wallet.getConfirmationCount(proposalId)).to.equal(1);
    });

    it("Should prevent double confirmation", async () => {
      await expect(wallet.connect(owner1).confirm(proposalId))
        .to.be.revertedWith("Already confirmed");
    });
  });

  // Owner Management
  describe("Owner Changes", () => {
    it("Should add new owner via proposal", async () => {
      // Create addOwner proposal
      const calldata = wallet.interface.encodeFunctionData("addOwner", [nonOwner.address]);
      await wallet.connect(owner1).propose(wallet.address, 0, calldata);
      
      // Confirm by 2 owners
      await wallet.connect(owner2).confirm(0);
      await wallet.connect(owner3).confirm(0);
      
      // Execute
      await wallet.execute(0);
      expect(await wallet.getOwners()).to.include(nonOwner.address);
    });

    it("Should prevent non-owner from removing owner", async () => {
      const calldata = wallet.interface.encodeFunctionData("removeOwner", [owner1.address]);
      await expect(wallet.connect(nonOwner).propose(wallet.address, 0, calldata))
        .to.be.revertedWith("Not an owner");
    });
  });

  // Threshold Changes
  describe("Threshold Management", () => {
    it("Should update threshold via proposal", async () => {
      const calldata = wallet.interface.encodeFunctionData("changeThreshold", [3]);
      await wallet.connect(owner1).propose(wallet.address, 0, calldata);
      
      await wallet.connect(owner2).confirm(0);
      await wallet.connect(owner3).confirm(0);
      await wallet.execute(0);
      
      expect(await wallet.getThreshold()).to.equal(3);
    });

    it("Should prevent invalid threshold", async () => {
      const calldata = wallet.interface.encodeFunctionData("changeThreshold", [5]); // More than owners
      await wallet.connect(owner1).propose(wallet.address, 0, calldata);
      await wallet.connect(owner2).confirm(0);
      
      await expect(wallet.execute(0))
        .to.be.revertedWith("Bad threshold");
    });
  });

  // AI Integration
  describe("AI Risk Scoring", () => {
    it("Should require oracle for risk scores", async () => {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x");
      await expect(wallet.connect(owner1).submitRiskScore(0, 7))
        .to.be.revertedWith("Not AI oracle");
    });

    it("Should increase threshold for risky proposals", async () => {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x");
      await wallet.connect(aiOracle).submitRiskScore(0, 7);
      
      const proposal = await wallet.getProposal(0);
      const required = proposal.aiRiskScore >= 5 ? 2 + 2 : 2;
      expect(proposal.confirmations).to.be.lessThan(required);
    });
  });

  // Cancellation
  describe("Proposal Cancellation", () => {
    it("Should allow proposer to cancel", async () => {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x");
      await wallet.connect(owner1).cancel(0);
      const proposal = await wallet.getProposal(0);
      expect(proposal.cancelled).to.be.true;
    });

    it("Should prevent unauthorized cancellation", async () => {
      await wallet.connect(owner1).propose(owner2.address, 100, "0x");
      await expect(wallet.connect(owner2).cancel(0))
        .to.be.revertedWith("Threshold not met");
    });
  });
});