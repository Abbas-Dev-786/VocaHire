// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVoiceAgentRegistry {
    function getPayout(address agentController) external view returns (address);

    function isActive(address agentController) external view returns (bool);
}

contract VoiceJobEscrow is Ownable, ReentrancyGuard {
    IERC20 public immutable USDC;
    IVoiceAgentRegistry public immutable registry;

    address public relayer; // backend signer allowed to mark jobs completed

    struct Job {
        address client;
        address agentController;
        uint256 amount; // 6 decimals
        bool completed;
        bool canceled;
    }

    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;

    event JobOpened(
        uint256 indexed id,
        address indexed client,
        address indexed agentController,
        uint256 amount
    );
    event JobCompleted(uint256 indexed id, address agentPayout, uint256 amount);
    event JobCanceled(uint256 indexed id);
    event RelayerUpdated(address indexed relayer);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "not relayer");
        _;
    }

    constructor(
        address initialOwner,
        address usdc,
        address registryAddr
    ) Ownable(initialOwner) {
        require(usdc != address(0) && registryAddr != address(0), "zero addr");
        USDC = IERC20(usdc);
        registry = IVoiceAgentRegistry(registryAddr);
    }

    function setRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "zero relayer");
        relayer = _relayer;
        emit RelayerUpdated(_relayer);
    }

    // Client must approve USDC to this contract before calling.
    function openJob(
        address agentController,
        uint256 amount
    ) external nonReentrant returns (uint256 jobId) {
        require(amount > 0, "amount=0");
        require(registry.isActive(agentController), "agent inactive");

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client: msg.sender,
            agentController: agentController,
            amount: amount,
            completed: false,
            canceled: false
        });

        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "transferFrom failed"
        );
        emit JobOpened(jobId, msg.sender, agentController, amount);
    }

    // Called by backend after ElevenLabs webhook verification.
    function markCompleted(uint256 jobId) external onlyRelayer nonReentrant {
        Job storage j = jobs[jobId];
        require(!j.completed && !j.canceled, "finalized");

        address payout = registry.getPayout(j.agentController);
        require(payout != address(0), "no payout");

        j.completed = true;
        require(USDC.transfer(payout, j.amount), "payout failed");

        emit JobCompleted(jobId, payout, j.amount);
    }

    // Refund if not completed.
    function cancel(uint256 jobId) external nonReentrant {
        Job storage j = jobs[jobId];
        require(msg.sender == j.client, "not client");
        require(!j.completed && !j.canceled, "finalized");

        j.canceled = true;
        require(USDC.transfer(j.client, j.amount), "refund failed");
        emit JobCanceled(jobId);
    }
}
