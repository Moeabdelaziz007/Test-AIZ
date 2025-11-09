// Energy-Aware Agent Frontend Application
// Minimal ethers.js app to interact with EnergyAwareAgent smart contract

let provider;
let signer;
let agentContract;
let currentDecisionId = null;

// Contract configuration
const AGENT_ADDRESS = "0xPASTE_YOUR_SEPOLIA_AGENT_ADDRESS_HERE";
const AGENT_ABI = [
  "function evaluateTask(string taskDescription, uint256 taskEnergyCost) public",
  "function setAgentId(string _agentId) public",
  "event TaskAccepted(string taskDescription, uint256 decisionId)",
  "event TaskDeferred(string reason, uint256 decisionId)"
];

// ===== Utility Functions =====

/**
 * Format timestamp for log entries
 */
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

/**
 * Append log message to console with styling
 */
function appendLog(msg, type = 'info') {
  const logs = document.getElementById('logs');
  const timestamp = getTimestamp();
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type}`;
  logEntry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${msg}`;
  logs.appendChild(logEntry);
  
  // Auto-scroll to bottom
  logs.scrollTop = logs.scrollHeight;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
    console.error('Copy failed:', err);
  }
}

/**
 * Update wallet connection status UI
 */
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

/**
 * Show/hide decision ID section
 */
function updateDecisionDisplay(decisionId) {
  const section = document.getElementById('decision-section');
  const valueElement = document.getElementById('decision-id');
  
  if (decisionId) {
    currentDecisionId = decisionId.toString();
    valueElement.textContent = currentDecisionId;
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
}

// ===== Wallet Connection =====

/**
 * Connect to MetaMask wallet
 */
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
    showToast('Wallet connected successfully', 'success');

    // Check if contract address is configured
    if (AGENT_ADDRESS === '0xPASTE_YOUR_SEPOLIA_AGENT_ADDRESS_HERE') {
      appendLog('⚠️ Please update AGENT_ADDRESS in frontend/scripts/app.js with deployed contract address', 'warning');
      showToast('Contract address not configured', 'warning');
      return;
    }

    // Initialize contract
    agentContract = new ethers.Contract(AGENT_ADDRESS, AGENT_ABI, signer);
    appendLog(`📄 Contract initialized at ${AGENT_ADDRESS}`, 'info');

    // Set up event listeners
    setupEventListeners();
    
  } catch (error) {
    appendLog(`❌ Connection failed: ${error.message}`, 'error');
    showToast('Connection failed', 'error');
    console.error('Wallet connection error:', error);
  }
}

/**
 * Set up contract event listeners
 */
function setupEventListeners() {
  if (!agentContract) return;

  agentContract.on('TaskAccepted', (taskDescription, decisionId) => {
    appendLog(`✅ Task Accepted!`, 'success');
    appendLog(`📝 Description: ${taskDescription}`, 'info');
    appendLog(`🔑 Proof of Thought (DecisionID): ${decisionId}`, 'success');
    updateDecisionDisplay(decisionId);
    showToast('Task accepted!', 'success');
  });

  agentContract.on('TaskDeferred', (reason, decisionId) => {
    appendLog(`⏸️ Task Deferred`, 'warning');
    appendLog(`📝 Reason: ${reason}`, 'warning');
    appendLog(`🔑 Proof of Thought (DecisionID): ${decisionId}`, 'info');
    updateDecisionDisplay(decisionId);
    showToast('Task deferred', 'warning');
  });
}

// ===== Task Submission =====

/**
 * Submit task to the agent contract
 */
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
  
  try {
    const tx = await agentContract.evaluateTask(desc, cost);
    appendLog(`📤 Transaction submitted: ${tx.hash}`, 'info');
    showToast('Transaction submitted...', 'info');
    
    await tx.wait();
    appendLog(`✅ Transaction mined successfully`, 'success');
    
    // Clear form
    document.getElementById('task-desc').value = '';
    document.getElementById('task-cost').value = '';
    
  } catch (error) {
    appendLog(`❌ Error: ${error.message}`, 'error');
    showToast('Transaction failed', 'error');
    console.error('Task submission error:', error);
  }
}

// ===== Agent Configuration =====

/**
 * Update agent ID
 */
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
    
  } catch (error) {
    appendLog(`❌ Error updating Agent ID: ${error.message}`, 'error');
    showToast('Update failed', 'error');
    console.error('Agent ID update error:', error);
  }
}

// ===== Log Management =====

/**
 * Clear all logs
 */
function clearLogs() {
  const logs = document.getElementById('logs');
  logs.innerHTML = '';
  showToast('Logs cleared', 'info');
}

/**
 * Copy logs to clipboard
 */
function copyLogs() {
  const logs = document.getElementById('logs');
  const logText = logs.innerText || logs.textContent;
  
  if (!logText.trim()) {
    showToast('No logs to copy', 'warning');
    return;
  }
  
  copyToClipboard(logText);
}

/**
 * Copy decision ID to clipboard
 */
function copyDecisionId() {
  if (currentDecisionId) {
    copyToClipboard(currentDecisionId);
  }
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
  
  // Initial log
  appendLog('🚀 Energy-Aware Agent Interface initialized', 'info');
  appendLog('👉 Connect your wallet to get started', 'info');
  
  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        appendLog('🔌 Wallet disconnected', 'warning');
        updateWalletStatus(false);
        agentContract = null;
      } else {
        appendLog('🔄 Account changed, please reconnect', 'info');
        updateWalletStatus(false);
        agentContract = null;
      }
    });
    
    window.ethereum.on('chainChanged', () => {
      appendLog('🔄 Network changed, reloading...', 'info');
      window.location.reload();
    });
  }
});