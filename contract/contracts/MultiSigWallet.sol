// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    event TransactionExecuted(uint256 indexed id, address executor, bool success);
    event ProposalCancelled(uint256 indexed id);
    event RiskScoreSubmitted(uint256 indexed id, uint8 score);
    event OwnerAdded(address owner);
    event OwnerRemoved(address owner);
    event ThresholdChanged(uint256 newThreshold);

    /* ===== State ===== */
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;
    address public immutable aiOracle;
    bool private locked;

    struct Proposal {
        address proposer;
        address to;
        uint256 value;
        bytes data;
        uint256 confirmations;
        bool executed;
        bool cancelled;
        uint8 aiRiskScore;
        uint256 createdAt;
    }

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public confirmed;

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

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "Caller is not the contract itself");
        _;
    }

    /* ===== Constructor ===== */
    constructor(
        address[] calldata initialOwners,
        uint256 _threshold,
        address oracle
    ) {
        require(_threshold > 0, "Threshold must be > 0");
        require(_threshold <= initialOwners.length, "Threshold exceeds owner count");
        require(oracle != address(0), "Invalid oracle address");

        for (uint i = 0; i < initialOwners.length; i++) {
            address owner = initialOwners[i];
            require(owner != address(0), "Zero address owner");
            require(!isOwner[owner], "Duplicate owner detected");
            
            isOwner[owner] = true;
            owners.push(owner);
        }

        threshold = _threshold;
        aiOracle = oracle;
    }

    receive() external payable {}
    fallback() external payable {}

    /* ===== View Functions ===== */
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getThreshold() external view returns (uint256) {
        return threshold;
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
            uint8 aiRiskScore,
            uint256 createdAt
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
            p.aiRiskScore,
            p.createdAt
        );
    }

    function isConfirmed(uint256 id, address owner) external view returns (bool) {
        return confirmed[id][owner];
    }

    /* ===== Proposal Creation ===== */
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
                aiRiskScore: 0,
                createdAt: block.timestamp
            })
        );

        uint256 pid = proposals.length - 1;
        _confirm(pid);

        emit ProposalCreated(pid, msg.sender, to, value, data);
        return pid;
    }

    /* ===== Nomination ===== */
    function nominateOwner(address nominee) external returns (uint256) {
        require(nominee != address(0), "Zero nominee");

        bytes memory callData = abi.encodeWithSignature("addOwner(address)", nominee);

        proposals.push(
            Proposal({
                proposer: msg.sender,
                to: address(this),
                value: 0,
                data: callData,
                confirmations: 0,
                executed: false,
                cancelled: false,
                aiRiskScore: 0,
                createdAt: block.timestamp
            })
        );

        uint256 pid = proposals.length - 1;
        emit ProposalCreated(pid, msg.sender, address(this), 0, callData);
        return pid;
    }

    /* ===== Confirmation ===== */
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

    /* ===== Execution ===== */
    function execute(uint256 id)
        external
        onlyOwner
        nonReentrant
        exists(id)
        notExecuted(id)
        notCancelled(id)
    {
        Proposal storage p = proposals[id];
        
        // Ensure minimum time has passed (prevents front-running)
        require(block.timestamp >= p.createdAt + 30 seconds, "Cooldown period");
        
        uint256 required = p.aiRiskScore >= 5 ? threshold + 2 : threshold;
        require(p.confirmations >= required, "Insufficient confirmations");

        p.executed = true;

        (bool success, ) = p.to.call{value: p.value}(p.data);
        require(success, "Execution failed");
        emit TransactionExecuted(id, msg.sender, success);
    }

    /* ===== Cancellation ===== */
    function cancel(uint256 id)
        external
        exists(id)
        notExecuted(id)
        notCancelled(id)
    {
        Proposal storage p = proposals[id];
        if (msg.sender != p.proposer) {
            require(p.confirmations >= threshold, "Threshold not met for other-owner cancel");
        }
        p.cancelled = true;
        emit ProposalCancelled(id);
    }

    /* ===== AI Risk Score Submission ===== */
    function submitRiskScore(uint256 id, uint8 score)
        external
        onlyAIOracle
        exists(id)
    {
        require(score <= 10, "Score too high");
        proposals[id].aiRiskScore = score;
        emit RiskScoreSubmitted(id, score);
    }

    /* ===== Owner Management ===== */
    function addOwner(address newOwner) external onlySelf {
        require(newOwner != address(0) && !isOwner[newOwner], "Bad new owner");
        isOwner[newOwner] = true;
        owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address ownerToRemove) external onlySelf {
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

    function changeThreshold(uint256 newThreshold) external onlySelf {
        require(newThreshold > 0 && newThreshold <= owners.length, "Bad threshold");
        threshold = newThreshold;
        emit ThresholdChanged(newThreshold);
    }
}