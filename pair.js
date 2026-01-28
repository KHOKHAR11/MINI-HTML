const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
let botCount = 28; // Default starting count
const MAX_BOTS = 50;
const FIXED_CODE = "ADEEL1MD";

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    syncWithHeroku(); // Load live data on start
    
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
});

// --- LIVE SYNC LOGIC ---
async function syncWithHeroku() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            if (data.count) {
                botCount = data.count;
                updateServerStats();
            }
        }
    } catch (error) {
        console.log("Using local count mode");
        updateServerStats();
    }
}

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    generateBtn.addEventListener('click', generatePairCode);
    copyBtn.addEventListener('click', copyPairCode);
}

function updateServerStats() {
    // Sync with your HTML IDs
    const activeBotsEl = document.getElementById('activeCount');
    const serverLimitEl = document.getElementById('limitCount');
    const energyPercentEl = document.getElementById('energyText');
    const energyFill = document.getElementById('energyFill');

    if(activeBotsEl) activeBotsEl.textContent = botCount;
    if(serverLimitEl) serverLimitEl.textContent = MAX_BOTS;
    
    const energyPercent = Math.round((botCount / MAX_BOTS) * 100);
    
    if(energyPercentEl) energyPercentEl.textContent = energyPercent + '%';
    if(energyFill) {
        energyFill.style.background = `conic-gradient(var(--accent-gold) ${energyPercent}%, transparent 0%)`;
    }
}

async function generatePairCode() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const generateBtn = document.getElementById('generateBtn');
    
    if (!phoneInput) return;
    
    let formattedNumber = phoneInput.replace(/\D/g, '');
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating...';
    
    try {
        const response = await fetch(`${API_URL}?number=${formattedNumber}`);
        const data = await response.json();
        const pairingCode = data.code || data.pairCode || FIXED_CODE;
        
        displayPairingCode(pairingCode);
        syncWithHeroku(); // Refresh count after generating
        
    } catch (error) {
        displayPairingCode(FIXED_CODE);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate Now';
    }
}

function displayPairingCode(code) {
    const pairCodeEl = document.getElementById('pairCode');
    const resultBox = document.getElementById('resultBox');
    
    if (pairCodeEl) pairCodeEl.textContent = code;
    if (resultBox) resultBox.classList.add('show');
}

function copyPairCode() {
    const code = document.getElementById('pairCode').textContent;
    navigator.clipboard.writeText(code);
    alert('Code Copied!');
}

// Auto refresh every 60 seconds
setInterval(syncWithHeroku, 60000);
