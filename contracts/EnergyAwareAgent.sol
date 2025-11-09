// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IZentixProtocol.sol";

contract EnergyAwareAgent {
    IAIZOrchestrator public orchestrator;
    IConsciousDecisionLogger public logger;
    IIntentBus public intentBus;
    IMEVHarvester public mevHarvester;

    uint256 public agentVitality;
    string public agentId;

    uint256 public constant VITALITY_THRESHOLD = 50;
    uint256 public constant NETWORK_THRESHOLD = 70;

    event TaskAccepted(string taskDescription, uint256 decisionId);
    event TaskDeferred(string reason, uint256 decisionId);

    constructor(
        address _orchestrator,
        address _logger,
        address _intentBus,
        address _mevHarvester
    ) {
        orchestrator = IAIZOrchestrator(_orchestrator);
        logger = IConsciousDecisionLogger(_logger);
        intentBus = IIntentBus(_intentBus);
        mevHarvester = IMEVHarvester(_mevHarvester);
        agentVitality = 100; // default starting vitality
        agentId = "EnergyAwareAgent_v1";
    }

    function setAgentId(string memory _agentId) public {
        agentId = _agentId;
    }

    // Allow tests / admin to set vitality for scenarios
    function setAgentVitality(uint256 v) public {
        agentVitality = v;
    }

    function registerAgent() public {
        // The Zentix protocol uses a registry/orchestrator pattern for registration.
        // In the real deployment this should register with the appropriate registry.
        // Placeholder no-op to keep the interface stable for tests and demos.
        // TODO: call registry.registerAgent(...) when registry interface is available.
    }

    struct DecisionContext {
        uint256 currentVitality;
        uint256 currentNetworkEfficiency;
        uint256 estimatedTaskCost;
        string taskDescription;
    }

    function evaluateTask(string memory taskDescription, uint256 taskEnergyCost) public {
        // Get performance metrics from the MEV harvester (totalOps, successfulOps, failedOps, avgGas)
        (uint256 totalOps, uint256 successfulOps, uint256 failedOps, uint256 avgGas) = mevHarvester.getPerformanceMetrics();

        uint256 currentNetworkMetric = 0;
        if (totalOps > 0) {
            // success rate as percentage (0-100)
            currentNetworkMetric = (successfulOps * 100) / totalOps;
        }

        DecisionContext memory context = DecisionContext({
            currentVitality: agentVitality,
            // Use success rate (0-100) as network efficiency metric
            currentNetworkEfficiency: currentNetworkMetric,
            estimatedTaskCost: taskEnergyCost,
            taskDescription: taskDescription
        });

        if (
            context.currentVitality >= VITALITY_THRESHOLD &&
            context.currentNetworkEfficiency >= NETWORK_THRESHOLD &&
            context.currentVitality >= context.estimatedTaskCost
        ) {
            // Accept task
            // Log conscious decision using Zentix logger signature
            string[] memory collaborators = new string[](0);
            uint256 decisionId = logger.logConsciousDecision(
                agentId,
                "TASK_ACCEPTED",
                collaborators,
                "{}",
                "{}",
                "{\"state\":\"accepted\"}",
                "{}"
            );
            // Reduce vitality
            if (taskEnergyCost <= agentVitality) {
                agentVitality -= taskEnergyCost;
            } else {
                agentVitality = 0;
            }
            // TODO: Call IntentBus to execute task
            emit TaskAccepted(taskDescription, decisionId);
        } else {
            // Defer task
            string[] memory collaborators = new string[](0);
            uint256 decisionId = logger.logConsciousDecision(
                agentId,
                "TASK_DEFERRED",
                collaborators,
                "{}",
                "{}",
                "{\"state\":\"deferred\"}",
                "{}"
            );
            emit TaskDeferred("Insufficient energy or network efficiency", decisionId);
        }
    }
}
