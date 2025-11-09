const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('EnergyAwareAgent', function () {
  let orchestrator, logger, intentBus, mev, agent;

  beforeEach(async function () {
  const MockOrchestrator = await ethers.getContractFactory('MockOrchestrator');
  orchestrator = await MockOrchestrator.deploy();
  await orchestrator.waitForDeployment();

  const MockConsciousDecisionLogger = await ethers.getContractFactory('MockConsciousDecisionLogger');
  logger = await MockConsciousDecisionLogger.deploy();
  await logger.waitForDeployment();

  const MockIntentBus = await ethers.getContractFactory('MockIntentBus');
  intentBus = await MockIntentBus.deploy();
  await intentBus.waitForDeployment();

  const MockMEVHarvester = await ethers.getContractFactory('MockMEVHarvester');
  mev = await MockMEVHarvester.deploy(100);
  await mev.waitForDeployment();
  // set metrics so success rate = 100% (10/10)
  await (await mev.setMetrics(10, 10, 0, 100));

  const EnergyAwareAgent = await ethers.getContractFactory('EnergyAwareAgent');
  agent = await EnergyAwareAgent.deploy(orchestrator.target, logger.target, intentBus.target, mev.target);
  await agent.waitForDeployment();
  });

  it('should accept task when energy is high', async function () {
    // set vitality high
    await agent.setAgentVitality(100);

  // The mock returns callCount (1) by default as the decisionId for the first call
  const tx = await agent.evaluateTask('Test Task', 30);
      await expect(tx).to.emit(agent, 'TaskAccepted');
      const callCount = await logger.callCount();
      expect(callCount).to.equal(1);
      const vitality = await agent.agentVitality();
      expect(vitality).to.equal(70);
  });

  it('should log its decision context when deferring a task', async function () {
    // set vitality below threshold
    await agent.setAgentVitality(40);

  // The mock returns callCount (1) by default as the decisionId for the first call
  const tx = await agent.evaluateTask('Deferred Task', 30);
    await expect(tx).to.emit(agent, 'TaskDeferred');
    // logger should have recorded exactly one call
    const callCount = await logger.callCount();
    expect(callCount).to.equal(1);
  });
});
