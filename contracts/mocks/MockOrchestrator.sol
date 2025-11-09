// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockOrchestrator {
    event AgentRegistered(string name, address agentAddress);

    function registerAgent(string memory name, address agentAddress) external {
        emit AgentRegistered(name, agentAddress);
    }
}
