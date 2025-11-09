// Minimal ethers.js app to interact with EnergyAwareAgent
let provider;
let signer;
let agentContract;

// TODO: Replace with deployed address after running deploy script
const AGENT_ADDRESS = "REPLACE_WITH_AGENT_ADDRESS";

const AGENT_ABI = [
  "function evaluateTask(string taskDescription, uint256 taskEnergyCost) public",
  "function setAgentId(string _agentId) public",
  "event TaskAccepted(string taskDescription, uint256 decisionId)",
  "event TaskDeferred(string reason, uint256 decisionId)"
];

function appendLog(msg) {
  const logs = document.getElementById('logs');
  logs.innerText = logs.innerText + '\n' + msg;
}

async function connectWallet() {
  if (!window.ethereum) {
    appendLog('MetaMask not detected');
    return;
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  appendLog('Wallet connected');

  if (AGENT_ADDRESS === 'REPLACE_WITH_AGENT_ADDRESS') {
    appendLog('Please update AGENT_ADDRESS in frontend/scripts/app.js with deployed contract address');
    return;
  }

  agentContract = new ethers.Contract(AGENT_ADDRESS, AGENT_ABI, signer);

  agentContract.on('TaskAccepted', (taskDescription, decisionId) => {
    appendLog('Task Accepted! Proof of Thought (DecisionID): ' + decisionId);
    appendLog('Description: ' + taskDescription);
  });

  agentContract.on('TaskDeferred', (reason, decisionId) => {
    appendLog('Task Deferred. Reason: ' + reason + '. Proof of Thought (DecisionID): ' + decisionId);
  });
}

async function submitTask() {
  if (!agentContract) {
    appendLog('Contract not initialized. Connect wallet and set AGENT_ADDRESS.');
    return;
  }
  const desc = document.getElementById('task-desc').value;
  const cost = Number(document.getElementById('task-cost').value || 0);

  appendLog('Submitting task: ' + desc + ' (cost: ' + cost + ')');
  try {
    const tx = await agentContract.evaluateTask(desc, cost);
    appendLog('Transaction submitted: ' + tx.hash);
    await tx.wait();
    appendLog('Transaction mined');
  } catch (e) {
    appendLog('Error: ' + e.message);
  }
}

async function updateAgentId() {
  if (!agentContract) {
    appendLog('Contract not initialized. Connect wallet and set AGENT_ADDRESS.');
    return;
  }
  const newId = document.getElementById('agent-id-input').value;
  try {
    const tx = await agentContract.setAgentId(newId);
    appendLog('setAgentId tx: ' + tx.hash);
    await tx.wait();
    appendLog('Agent ID updated to: ' + newId);
  } catch (e) {
    appendLog('Error updating agentId: ' + e.message);
  }
}

document.getElementById('update-agent-id-btn').addEventListener('click', updateAgentId);

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('submit-task-btn').addEventListener('click', submitTask);
