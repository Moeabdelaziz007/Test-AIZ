
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAIZOrchestrator {
    // Basic externally-callable helpers present on orchestrators
    function hasCapability(string memory capability) external view returns (bool);
    function getCapabilityLimit(string memory capability) external view returns (uint256);
    function getAIZInfo() external view returns (bytes32, string memory, string memory, address, bool);
}

interface IConsciousDecisionLogger {
    // Matches ConsciousDecisionLogger.logConsciousDecision in Zentix-Protocol
    function logConsciousDecision(
        string calldata agentId,
        string calldata project,
        string[] calldata collaborators,
        string calldata skillsJson,
        string calldata rolesJson,
        string calldata consciousnessState,
        string calldata dnaExpression
    ) external returns (uint256);

    function logCrossChainDecision(
        string calldata agentId,
        string calldata project,
        string[] calldata collaborators,
        string calldata skillsJson,
        string calldata rolesJson,
        string calldata consciousnessState,
        string calldata dnaExpression
    ) external;
}

interface IIntentBus {
    // IntentBus in Zentix-Protocol: postIntent / solveIntent
    function postIntent(
        bytes calldata data,
        uint256 expiry,
        uint256 reward,
        address rewardToken,
        bool isCollaborative
    ) external returns (bytes32);

    function postIntent(
        bytes calldata data,
        uint256 expiry,
        uint256 reward,
        address rewardToken
    ) external returns (bytes32);

    function solveIntent(bytes32 intentId, bytes calldata solutionData) external;
}

interface IMEVHarvester {
    // Enhanced AIZ orchestrators expose performance metrics used as "network state"
    function getPerformanceMetrics() external view returns (uint256, uint256, uint256, uint256);
}
