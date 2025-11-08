// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract VoiceAgentRegistry is Ownable {
    struct Agent {
        address payout;
        string metaURI;
        bool active;
    }

    // agentController => Agent
    mapping(address => Agent) private agents;

    event AgentUpserted(address indexed agentController, address payout, string metaURI, bool active);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function upsertAgent(
        address agentController,
        address payout,
        string calldata metaURI,
        bool active
    ) external onlyOwner {
        require(agentController != address(0), "invalid controller");
        require(payout != address(0), "invalid payout");
        agents[agentController] = Agent({payout: payout, metaURI: metaURI, active: active});
        emit AgentUpserted(agentController, payout, metaURI, active);
    }

    function getPayout(address agentController) external view returns (address) {
        return agents[agentController].payout;
    }

    function getMeta(address agentController) external view returns (Agent memory) {
        return agents[agentController];
    }

    function isActive(address agentController) external view returns (bool) {
        return agents[agentController].active;
    }
}