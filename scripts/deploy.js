// EnergyAwareAgent + mocks deploy script for Sepolia
require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy MockMEVHarvester
  const MockMEVHarvester = await hre.ethers.getContractFactory('MockMEVHarvester');
  const mevHarvester = await MockMEVHarvester.deploy();
  await mevHarvester.deployed();
  console.log('MockMEVHarvester deployed to:', mevHarvester.address);

  // Deploy MockConsciousDecisionLogger
  const MockConsciousDecisionLogger = await hre.ethers.getContractFactory('MockConsciousDecisionLogger');
  const logger = await MockConsciousDecisionLogger.deploy();
  await logger.deployed();
  console.log('MockConsciousDecisionLogger deployed to:', logger.address);

  // Deploy EnergyAwareAgent
  const EnergyAwareAgent = await hre.ethers.getContractFactory('EnergyAwareAgent');
  const agent = await EnergyAwareAgent.deploy(
    mevHarvester.address,
    logger.address
  );
  await agent.deployed();
  console.log('EnergyAwareAgent deployed to:', agent.address);

  // Print all addresses for frontend update
  console.log('\nDeployment complete!');
  console.log('EnergyAwareAgent:', agent.address);
  console.log('MockMEVHarvester:', mevHarvester.address);
  console.log('MockConsciousDecisionLogger:', logger.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
