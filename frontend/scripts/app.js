// Energy-Aware Agent Frontend Application - AIZ Protocol Integration
// Enhanced UI with real-time metrics, DeFi strategies, and intent bus

let provider;
let signer;
let agentContract;
let currentDecisionId = null;

// Performance tracking
let performanceMetrics = {
  tasksCompleted: 0,
  tasksSuccessful: 0,
  tasksFailed: 0,
  decisionsLogged: 0,
  currentTier: 'bronze',
  vitalityHistory: [100],
  efficiencyHistory: [0]
};

// Contract configuration
const AGENT_ADDRESS = "0xPASTE_YOUR_SEPOLIA_AGENT_ADDRESS_HERE";
const AGENT_ABI = [
  "function evaluateTask(string taskDescription, uint256 taskEnergyCost) public",
  "function setAgentId(string _agentId) public",
  "function agentVitality() public view returns (uint256)",
  "event TaskAccepted(string taskDescription, uint256 decisionId)",
  "event TaskDeferred(string reason, uint256 decisionId)"
];

// Network configurations
const NETWORKS = {
  1: { name: 'Ethereum Mainnet', icon: '🔷' },
  11155111: { name: 'Sepolia', icon: '🧪' },
  10: { name: 'Optimism', icon: '🔴' },
  8453: { name: 'Base', icon: '🔵' },
  84532: { name: 'Base Sepolia', icon: '🔵' }
};

// Performance tiers
const TIERS = {
  bronze: { icon: '🥉', name: 'Bronze', multiplier: 1.0, threshold: 0 },
  silver: { icon: '🥈', name: 'Silver', multiplier: 1.5, threshold: 10 },
  gold: { icon: '🥇', name: 'Gold', multiplier: 2.0, threshold: 25 },
  platinum: { icon: '💎', name: 'Platinum', multiplier: 3.0, threshold: 50 },
  diamond: { icon: '💠', name: 'Diamond', multiplier: 5.0, threshold: 100 }
};

// ===== Utility Functions =====

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

function appendLog(msg, type = 'info') {
  const logs = document.getElementById('logs');
  const timestamp = getTimestamp();
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type} animate__animated animate__fadeIn`;
  logEntry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${msg}`;
  logs.appendChild(logEntry);
  logs.scrollTop = logs.scrollHeight;
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
    console.error('Copy failed:', err);
  }
}

// ===== UI Update Functions =====

function updateAgentStatus(active) {
  const statusDot = document.getElementById('agent-status-dot');
  const statusText = document.getElementById('agent-status-text');
  
  if (active) {
    statusDot.classList.add('active');
    statusText.textContent = 'Active';
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'Inactive';
  }
}

function updateVitality(value) {
  const vitalityValue = document.getElementById('vitality-value');
  const vitalityFill = document.getElementById('vitality-fill');
  
  vitalityValue.textContent = value;
  vitalityFill.style.width = `${value}%`;
  
  // Update color based on value
  if (value < 30) {
    vitalityFill.style.background = 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)';
  } else if (value < 60) {
    vitalityFill.style.background = 'linear-gradient(135deg, #f59e0b 0%, #aeea00 100%)';
  } else {
    vitalityFill.style.background = 'var(--accent-gradient)';
  }
  
  performanceMetrics.vitalityHistory.push(value);
  if (performanceMetrics.vitalityHistory.length > 20) {
    performanceMetrics.vitalityHistory.shift();
  }
}

function updateNetworkEfficiency(value) {
  const efficiencyValue = document.getElementById('efficiency-value');
  const efficiencyFill = document.getElementById('efficiency-fill');
  
  efficiencyValue.textContent = `${value}%`;
  efficiencyFill.style.width = `${value}%`;
  
  performanceMetrics.efficiencyHistory.push(value);
  if (performanceMetrics.efficiencyHistory.length > 20) {
    performanceMetrics.efficiencyHistory.shift();
  }
}

function updatePerformanceTier() {
  const tasksCompleted = performanceMetrics.tasksCompleted;
  let currentTier = 'bronze';
  
  for (const [tier, config] of Object.entries(TIERS)) {
    if (tasksCompleted >= config.threshold) {
      currentTier = tier;
    }
  }
  
  performanceMetrics.currentTier = currentTier;
  const tierConfig = TIERS[currentTier];
  
  const tierBadge = document.getElementById('tier-badge');
  const tierMultiplier = document.getElementById('tier-multiplier');
  
  tierBadge.innerHTML = `
    <span class="tier-icon">${tierConfig.icon}</span>
    <span class="tier-name">${tierConfig.name}</span>
  `;
  tierMultiplier.textContent = `${tierConfig.multiplier}x Rewards`;
  
  // Update metrics display
  document.getElementById('reward-multiplier').textContent = `${tierConfig.multiplier}x`;
}

function updatePerformanceMetrics() {
  document.getElementById('tasks-completed').textContent = performanceMetrics.tasksCompleted;
  
  const successRate = performanceMetrics.tasksCompleted > 0
    ? Math.round((performanceMetrics.tasksSuccessful / performanceMetrics.tasksCompleted) * 100)
    : 0;
  document.getElementById('success-rate').textContent = `${successRate}%`;
  
  document.getElementById('decisions-logged').textContent = performanceMetrics.decisionsLogged;
  
  updatePerformanceTier();
}

function updateWalletStatus(connected, address = null) {
  const statusElement = document.getElementById('wallet-status');
  const addressElement = document.getElementById('wallet-address');
  const connectBtn = document.getElementById('connect-text');
  
  if (connected && address) {
    statusElement.classList.add('connected');
    addressElement.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    connectBtn.textContent = 'Connected';
  } else {
    statusElement.classList.remove('connected');
    addressElement.textContent = 'Not connected';
    connectBtn.textContent = 'Connect Wallet';
  }
}

async function updateNetworkInfo() {
  if (!provider) return;
  
  try {
    const network = await provider.getNetwork();
    const networkConfig = NETWORKS[Number(network.chainId)] || { name: 'Unknown', icon: '🌐' };
    
    const networkDisplay = document.getElementById('network-display');
    networkDisplay.innerHTML = `
      <span class="network-icon">${networkConfig.icon}</span>
      <span id="network-name">${networkConfig.name}</span>
    `;
    
    // Update balance
    if (signer) {
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      document.getElementById('balance-value').textContent = parseFloat(balanceInEth).toFixed(4);
    }
    
    // Update gas price
    const feeData = await provider.getFeeData();
    if (feeData.gasPrice) {
      const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
      document.getElementById('gas-value').textContent = parseFloat(gasPriceGwei).toFixed(2);
    }
  } catch (error) {
    console.error('Error updating network info:', error);
  }
}

function updateDecisionDisplay(decisionId) {
  const section = document.getElementById('decision-section');
  const valueElement = document.getElementById('decision-id');
  
  if (decisionId) {
    currentDecisionId = decisionId.toString();
    valueElement.textContent = currentDecisionId;
    section.style.display = 'block';
    section.classList.add('animate__animated', 'animate__fadeIn');
    
    performanceMetrics.decisionsLogged++;
    updatePerformanceMetrics();
  } else {
    section.style.display = 'none';
  }
}

function updateAgentIdDisplay(agentId) {
  document.getElementById('display-agent-id').textContent = agentId;
}

// ===== Wallet Connection =====

async function connectWallet() {
  if (!window.ethereum) {
    appendLog('❌ MetaMask not detected. Please install MetaMask extension.', 'error');
    showToast('MetaMask not found', 'error');
    return;
  }

  try {
    appendLog('🔗 Requesting wallet connection...', 'info');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    appendLog(`✅ Wallet connected: ${address}`, 'success');
    updateWalletStatus(true, address);
    updateAgentStatus(true);
    showToast('Wallet connected successfully', 'success');
    
    await updateNetworkInfo();

    if (AGENT_ADDRESS === '0xPASTE_YOUR_SEPOLIA_AGENT_ADDRESS_HERE') {
      appendLog('⚠️ Please update AGENT_ADDRESS in frontend/scripts/app.js with deployed contract address', 'warning');
      showToast('Contract address not configured', 'warning');
      return;
    }

    agentContract = new ethers.Contract(AGENT_ADDRESS, AGENT_ABI, signer);
    appendLog(`📄 Contract initialized at ${AGENT_ADDRESS}`, 'info');
    
    // Fetch initial vitality
    try {
      const vitality = await agentContract.agentVitality();
      updateVitality(Number(vitality));
      appendLog(`⚡ Current vitality: ${vitality}`, 'info');
    } catch (error) {
      appendLog('⚠️ Could not fetch vitality from contract', 'warning');
    }

    setupEventListeners();
    
  } catch (error) {
    appendLog(`❌ Connection failed: ${error.message}`, 'error');
    showToast('Connection failed', 'error');
    console.error('Wallet connection error:', error);
  }
}

function setupEventListeners() {
  if (!agentContract) return;

  agentContract.on('TaskAccepted', (taskDescription, decisionId) => {
    appendLog(`✅ Task Accepted!`, 'success');
    appendLog(`📝 Description: ${taskDescription}`, 'info');
    appendLog(`🔑 Proof of Thought (DecisionID): ${decisionId}`, 'success');
    updateDecisionDisplay(decisionId);
    showToast('Task accepted!', 'success');
    
    performanceMetrics.tasksSuccessful++;
    updatePerformanceMetrics();
    
    // Simulate network efficiency increase
    const currentEfficiency = parseInt(document.getElementById('efficiency-value').textContent);
    updateNetworkEfficiency(Math.min(100, currentEfficiency + 10));
  });

  agentContract.on('TaskDeferred', (reason, decisionId) => {
    appendLog(`⏸️ Task Deferred`, 'warning');
    appendLog(`📝 Reason: ${reason}`, 'warning');
    appendLog(`🔑 Proof of Thought (DecisionID): ${decisionId}`, 'info');
    updateDecisionDisplay(decisionId);
    showToast('Task deferred', 'warning');
    
    performanceMetrics.tasksFailed++;
    updatePerformanceMetrics();
  });
}

// ===== Task Submission =====

async function submitTask(event) {
  event.preventDefault();
  
  if (!agentContract) {
    appendLog('❌ Contract not initialized. Please connect wallet first.', 'error');
    showToast('Connect wallet first', 'error');
    return;
  }

  const desc = document.getElementById('task-desc').value.trim();
  const cost = Number(document.getElementById('task-cost').value || 0);

  if (!desc) {
    appendLog('❌ Task description is required', 'error');
    showToast('Enter task description', 'error');
    return;
  }

  appendLog(`⚡ Submitting task: "${desc}" (Energy Cost: ${cost})`, 'info');
  performanceMetrics.tasksCompleted++;
  updatePerformanceMetrics();
  
  try {
    const tx = await agentContract.evaluateTask(desc, cost);
    appendLog(`📤 Transaction submitted: ${tx.hash}`, 'info');
    showToast('Transaction submitted...', 'info');
    
    await tx.wait();
    appendLog(`✅ Transaction mined successfully`, 'success');
    
    // Update vitality after task
    try {
      const vitality = await agentContract.agentVitality();
      updateVitality(Number(vitality));
    } catch (error) {
      // Estimate vitality decrease
      const currentVitality = parseInt(document.getElementById('vitality-value').textContent);
      updateVitality(Math.max(0, currentVitality - cost));
    }
    
    document.getElementById('task-desc').value = '';
    document.getElementById('task-cost').value = '';
    
  } catch (error) {
    appendLog(`❌ Error: ${error.message}`, 'error');
    showToast('Transaction failed', 'error');
    console.error('Task submission error:', error);
    performanceMetrics.tasksCompleted--;
    performanceMetrics.tasksFailed++;
    updatePerformanceMetrics();
  }
}

// ===== Agent Configuration =====

async function updateAgentId() {
  if (!agentContract) {
    appendLog('❌ Contract not initialized. Please connect wallet first.', 'error');
    showToast('Connect wallet first', 'error');
    return;
  }

  const newId = document.getElementById('agent-id-input').value.trim();
  
  if (!newId) {
    appendLog('❌ Agent ID cannot be empty', 'error');
    showToast('Enter agent ID', 'error');
    return;
  }

  try {
    appendLog(`🔄 Updating Agent ID to: ${newId}`, 'info');
    const tx = await agentContract.setAgentId(newId);
    appendLog(`📤 Transaction submitted: ${tx.hash}`, 'info');
    showToast('Updating agent ID...', 'info');
    
    await tx.wait();
    appendLog(`✅ Agent ID updated successfully to: ${newId}`, 'success');
    showToast('Agent ID updated', 'success');
    updateAgentIdDisplay(newId);
    
  } catch (error) {
    appendLog(`❌ Error updating Agent ID: ${error.message}`, 'error');
    showToast('Update failed', 'error');
    console.error('Agent ID update error:', error);
  }
}

// ===== Log Management =====

function clearLogs() {
  const logs = document.getElementById('logs');
  logs.innerHTML = '';
  showToast('Logs cleared', 'info');
}

function copyLogs() {
  const logs = document.getElementById('logs');
  const logText = logs.innerText || logs.textContent;
  
  if (!logText.trim()) {
    showToast('No logs to copy', 'warning');
    return;
  }
  
  copyToClipboard(logText);
}

function copyDecisionId() {
  if (currentDecisionId) {
    copyToClipboard(currentDecisionId);
  }
}

// ===== Strategy Cards Interaction =====

function setupStrategyCards() {
  const strategyCards = document.querySelectorAll('.strategy-card');
  
  strategyCards.forEach(card => {
    card.addEventListener('click', () => {
      const strategy = card.dataset.strategy;
      const strategyName = card.querySelector('.strategy-name').textContent;
      const apy = card.querySelector('.strategy-apy').textContent;
      
      appendLog(`💎 Selected strategy: ${strategyName} (${apy})`, 'info');
      showToast(`Strategy selected: ${strategyName}`, 'info');
    });
  });
}

// ===== Capability Badges Interaction =====

function setupCapabilityBadges() {
  const badges = document.querySelectorAll('.capability-badge');
  
  badges.forEach(badge => {
    badge.addEventListener('click', () => {
      const capability = badge.dataset.capability;
      const capName = badge.querySelector('.cap-name').textContent;
      
      appendLog(`🛠️ Capability accessed: ${capName}`, 'info');
      showToast(`Capability: ${capName}`, 'info');
    });
  });
}

// ===== Intent Bus =====

function setupIntentBus() {
  const postIntentBtn = document.getElementById('post-intent-btn');
  
  postIntentBtn.addEventListener('click', () => {
    appendLog('📡 Intent bus feature coming soon...', 'info');
    showToast('Intent bus integration in progress', 'info');
    
    // Simulate intent posting
    const activeIntents = document.getElementById('active-intents');
    activeIntents.textContent = parseInt(activeIntents.textContent) + 1;
  });
}

// ===== Modal Functions =====

function showModal(title, content) {
  const modal = document.getElementById('tx-modal');
  const modalBody = document.getElementById('modal-body');
  
  modal.querySelector('.modal-header h3').textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('tx-modal');
  modal.classList.remove('show');
}

// ===== Periodic Updates =====

function startPeriodicUpdates() {
  // Update network info every 30 seconds
  setInterval(async () => {
    if (provider && signer) {
      await updateNetworkInfo();
    }
  }, 30000);
  
  // Simulate network efficiency fluctuation
  setInterval(() => {
    if (agentContract) {
      const currentEfficiency = parseInt(document.getElementById('efficiency-value').textContent);
      const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
      const newEfficiency = Math.max(0, Math.min(100, currentEfficiency + change));
      updateNetworkEfficiency(newEfficiency);
    }
  }, 10000);
}

// ===== Event Listeners =====

document.addEventListener('DOMContentLoaded', () => {
  // Wallet connection
  document.getElementById('connect-btn').addEventListener('click', connectWallet);
  
  // Task submission
  document.getElementById('task-form').addEventListener('submit', submitTask);
  
  // Agent configuration
  document.getElementById('update-agent-id-btn').addEventListener('click', updateAgentId);
  
  // Log management
  document.getElementById('clear-logs-btn').addEventListener('click', clearLogs);
  document.getElementById('copy-logs-btn').addEventListener('click', copyLogs);
  
  // Decision ID copy
  document.getElementById('copy-decision-btn').addEventListener('click', copyDecisionId);
  
  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  
  // Close modal on background click
  document.getElementById('tx-modal').addEventListener('click', (e) => {
    if (e.target.id === 'tx-modal') {
      closeModal();
    }
  });
  
  // Setup interactive elements
  setupStrategyCards();
  setupCapabilityBadges();
  setupIntentBus();
  
  // Start periodic updates
  startPeriodicUpdates();
  
  // Initial logs
  appendLog('🚀 Energy-Aware Agent Interface initialized', 'info');
  appendLog('🔗 AIZ Protocol v2.0 loaded', 'success');
  appendLog('👉 Connect your wallet to get started', 'info');
  
  // Initialize metrics
  updatePerformanceMetrics();
  updateNetworkEfficiency(0);
  
  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        appendLog('🔌 Wallet disconnected', 'warning');
        updateWalletStatus(false);
        updateAgentStatus(false);
        agentContract = null;
      } else {
        appendLog('🔄 Account changed, please reconnect', 'info');
        updateWalletStatus(false);
        updateAgentStatus(false);
        agentContract = null;
      }
    });
    
    window.ethereum.on('chainChanged', () => {
      appendLog('🔄 Network changed, reloading...', 'info');
      window.location.reload();
    });
  }
});