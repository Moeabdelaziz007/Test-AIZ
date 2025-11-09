// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockConsciousDecisionLogger {
    uint256 public callCount;
    string public lastProject;
    string public lastAgentId;
    string public lastConsciousnessState;
    uint256 public nextDecisionId;

    event Logged(string indexed agentId, string project);

    function logConsciousDecision(
        string memory agentId,
        string memory project,
        string[] calldata collaborators,
        string calldata skillsJson,
        string calldata rolesJson,
        string calldata consciousnessState,
        string calldata dnaExpression
    ) external returns (uint256) {
        callCount += 1;
        lastProject = project;
        lastAgentId = agentId;
        lastConsciousnessState = consciousnessState;
        emit Logged(agentId, project);
        uint256 id = nextDecisionId;
        // If nextDecisionId not set, fallback to callCount
        if (id == 0) {
            id = callCount;
        } else {
            // increment so subsequent calls return different ids
            nextDecisionId = nextDecisionId + 1;
        }
        return id;
    }

    function logCrossChainDecision(
        string memory agentId,
        string memory project,
        string[] calldata collaborators,
        string calldata skillsJson,
        string calldata rolesJson,
        string calldata consciousnessState,
        string calldata dnaExpression
    ) external {
        // Record cross-chain decisions similarly
        callCount += 1;
        lastProject = project;
        lastAgentId = agentId;
        lastConsciousnessState = consciousnessState;
        emit Logged(agentId, project);
    }

    function setNextDecisionId(uint256 _id) external {
        nextDecisionId = _id;
    }
}
