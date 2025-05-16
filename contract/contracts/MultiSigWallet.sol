// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWallet {
    /* ===== Events ===== */
    event ProposalCreated(
        uint256 indexed id,
        address proposer,
        address to,
        uint256 value,
        bytes data
    );
    event ConfirmationAdded(uint256 indexed id, address owner);
    event TransactionExecuted(
        uint256 indexed id,
        address executor,
        bool success
    );
    event ProposalCancelled(uint256 indexed id);
    event RiskScoreSubmitted(uint256 indexed id, uint8 score);
    event OwnerAdded(address owner);
    event OwnerRemoved(address owner);
    event ThresholdChanged(uint256 newThreshold);

    /* ===== State ===== */
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;
    address public aiOracle;

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

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public confirmed;
    bool private initialized;

    /* ===== Modifiers ===== */
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }
    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "Not AI oracle");
        _;
    }
    modifier exists(uint256 id) {
        require(id < proposals.length, "No such proposal");
        _;
    }
    modifier notExecuted(uint256 id) {
        require(!proposals[id].executed, "Already executed");
        _;
    }
    modifier notCancelled(uint256 id) {
        require(!proposals[id].cancelled, "Cancelled");
        _;
    }

    /* ===== Constructor ===== */
    constructor() {
        address[3] memory ownerList = [
            0x6631775F2323DaB6DF571c6Aa49b0cC2A41721bc,
            0xaF3Cb2F439629b99B8401E1691a652c4564a610b,
            0x1d19F53854557C266CDCcA89314DD3f224affd0d
        ];
        uint256 t = 2;
        address oracle = 0x6631775F2323DaB6DF571c6Aa49b0cC2A41721bc;

        require(t > 0 && t <= ownerList.length, "Invalid threshold");
        require(oracle != address(0), "Invalid oracle");

        for (uint i = 0; i < ownerList.length; i++) {
            address o = ownerList[i];
            require(o != address(0) && !isOwner[o], "Bad owner");
            isOwner[o] = true;
            owners.push(o);
        }
        threshold = t;
        aiOracle = oracle;
    }

    receive() external payable {}
    fallback() external payable {}

    /* ===== View ===== */
    function getOwners() external view returns (address[] memory) {
        return owners;
    }
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
    function getProposal(uint256 id)
        external
        view
        returns (
            address proposer,
            address to,
            uint256 value,
            bytes memory data,
            uint256 confirmations,
            bool executed,
            bool cancelled,
            uint8 aiRiskScore
        )
    {
        Proposal storage p = proposals[id];
        return (
            p.proposer,
            p.to,
            p.value,
            p.data,
            p.confirmations,
            p.executed,
            p.cancelled,
            p.aiRiskScore
        );
    }
    function isConfirmed(uint256 id, address owner)
        external
        view
        returns (bool)
    {
        return confirmed[id][owner];
    }

    /* ===== Owner‑only Proposal ===== */
    function propose(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (uint256) {
        proposals.push(
            Proposal({
                proposer: msg.sender,
                to: to,
                value: value,
                data: data,
                confirmations: 0,
                executed: false,
                cancelled: false,
                aiRiskScore: 0
            })
        );
        uint256 pid = proposals.length - 1;
        _confirm(pid);
        emit ProposalCreated(pid, msg.sender, to, value, data);
        return pid;
    }

    /* ===== Public Nomination ===== */
    function nominateOwner(address nominee) external returns (uint256) {
        require(nominee != address(0), "Zero nominee");
        // Create a proposal to call addOwner(nominee)
        bytes memory callData = abi.encodeWithSignature(
            "addOwner(address)",
            nominee
        );
        proposals.push(
            Proposal({
                proposer: msg.sender,
                to: address(this),
                value: 0,
                data: callData,
                confirmations: 0,
                executed: false,
                cancelled: false,
                aiRiskScore: 0
            })
        );
        uint256 pid = proposals.length - 1;
        // auto‑confirm by the nominator
        confirmed[pid][msg.sender] = true;
        proposals[pid].confirmations = 1;
        emit ProposalCreated(pid, msg.sender, address(this), 0, callData);
        emit ConfirmationAdded(pid, msg.sender);
        return pid;
    }

    /* ===== Confirmation & Execution ===== */
    function confirm(uint256 id)
        external
        onlyOwner
        exists(id)
        notExecuted(id)
        notCancelled(id)
    {
        require(!confirmed[id][msg.sender], "Already confirmed");
        _confirm(id);
        emit ConfirmationAdded(id, msg.sender);
    }
    function _confirm(uint256 id) internal {
        confirmed[id][msg.sender] = true;
        proposals[id].confirmations += 1;
    }
    function execute(uint256 id)
        external
        onlyOwner
        exists(id)
        notExecuted(id)
        notCancelled(id)
    {
        Proposal storage p = proposals[id];
        require(p.confirmations >= threshold, "Insufficient confirmations");
        p.executed = true;
        (bool success, ) = p.to.call{value: p.value}(p.data);
        emit TransactionExecuted(id, msg.sender, success);
    }

    /* ===== Cancellation, AI & Owner mgmt ===== */
    function cancel(uint256 id)
        external
        onlyOwner
        exists(id)
        notExecuted(id)
        notCancelled(id)
    {
        proposals[id].cancelled = true;
        emit ProposalCancelled(id);
    }
    function submitRiskScore(uint256 id, uint8 score)
        external
        onlyAIOracle
        exists(id)
    {
        proposals[id].aiRiskScore = score;
        emit RiskScoreSubmitted(id, score);
    }
    function addOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0) && !isOwner[newOwner], "Bad new owner");
        isOwner[newOwner] = true;
        owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }
    function removeOwner(address ownerToRemove) external onlyOwner {
        require(isOwner[ownerToRemove], "Not an owner");
        isOwner[ownerToRemove] = false;
        // remove from array
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
        require(newThreshold > 0 && newThreshold <= owners.length, "Bad threshold");
        threshold = newThreshold;
        emit ThresholdChanged(newThreshold);
    }
}
