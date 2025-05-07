// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MultiSigWallet {
    event ProposalCreated(uint256 indexed id, address proposer, address to, uint256 value, bytes data);
    event ConfirmationAdded(uint256 indexed id, address owner);
    event TransactionExecuted(uint256 indexed id, address executor, bool success);
    event ProposalCancelled(uint256 indexed id);
    event RiskScoreSubmitted(uint256 indexed id, uint8 score);
    event OwnerAdded(address owner);
    event OwnerRemoved(address owner);
    event ThresholdChanged(uint256 newThreshold);

    struct Proposal {
        address proposer;
        address to;
        uint256 value;
        bytes data;
        uint256 confirmations;
        bool executed;
        bool cancelled;
        uint8 aiRiskScore;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;
    address public aiOracle;
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public confirmed;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner"); _;
    }
    modifier exists(uint256 id) {
        require(id < proposals.length, "No proposal"); _;
    }
    modifier notExecuted(uint256 id) {
        require(!proposals[id].executed, "Already executed"); _;
    }
    modifier notCancelled(uint256 id) {
        require(!proposals[id].cancelled, "Cancelled"); _;
    }

    constructor(address[] memory _owners, uint256 _threshold, address _aiOracle) {
        require(_owners.length > 0, "Owners required");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");
        aiOracle = _aiOracle;
        for (uint i = 0; i < _owners.length; i++) {
            address o = _owners[i];
            require(o != address(0) && !isOwner[o], "Invalid or duplicate owner");
            isOwner[o] = true;
            owners.push(o);
        }
        threshold = _threshold;
    }

    receive() external payable {}

    function getOwners() external view returns (address[] memory) { return owners; }
    function getThreshold() external view returns (uint256) { return threshold; }
    function proposalCount() external view returns (uint256) { return proposals.length; }

    function propose(address to, uint256 value, bytes calldata data) external onlyOwner returns (uint256) {
        proposals.push(Proposal(msg.sender, to, value, data, 0, false, false, 0));
        uint256 id = proposals.length - 1;
        _confirm(id);
        emit ProposalCreated(id, msg.sender, to, value, data);
        return id;
    }

    function confirm(uint256 id) external onlyOwner exists(id) notExecuted(id) notCancelled(id) {
        require(!confirmed[id][msg.sender], "Already confirmed");
        _confirm(id);
        emit ConfirmationAdded(id, msg.sender);
    }

    function _confirm(uint256 id) internal {
        confirmed[id][msg.sender] = true;
        proposals[id].confirmations++;
    }

    function execute(uint256 id) external onlyOwner exists(id) notExecuted(id) notCancelled(id) {
        Proposal storage p = proposals[id];
        require(p.confirmations >= threshold, "Insufficient confirmations");
        p.executed = true;
        (bool success, ) = p.to.call{value: p.value}(p.data);
        emit TransactionExecuted(id, msg.sender, success);
    }

    function cancel(uint256 id) external onlyOwner exists(id) notExecuted(id) notCancelled(id) {
        proposals[id].cancelled = true;
        emit ProposalCancelled(id);
    }

    function submitRisk(uint256 id, uint8 score) external exists(id) {
        require(msg.sender == aiOracle, "Only oracle");
        proposals[id].aiRiskScore = score;
        emit RiskScoreSubmitted(id, score);
    }

    function addOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0) && !isOwner[newOwner], "Invalid new owner");
        isOwner[newOwner] = true;
        owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address ownerToRemove) external onlyOwner {
        require(isOwner[ownerToRemove], "Not an owner");
        isOwner[ownerToRemove] = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        if (threshold > owners.length) {
            threshold = owners.length;
            emit ThresholdChanged(threshold);
        }
        emit OwnerRemoved(ownerToRemove);
    }

    function changeThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= owners.length, "Invalid threshold");
        threshold = newThreshold;
        emit ThresholdChanged(newThreshold);
    }
}