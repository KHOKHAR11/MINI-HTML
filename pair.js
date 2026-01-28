const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
const MAX_BOTS = 50;
const FIXED_CODE = "ADEEL1MD";
let botCount = 28; // Default count

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    syncHerokuStats(); // Start live sync
    
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
});

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    if(generateBtn) generateBtn.addEventListener('click', generatePairCode);
    if(copyBtn) copyBtn.addEventListener('click', copyPairCode);
}

// --- LIVE SYNC FROM HEROKU ---
async function syncHerokuStats() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            botCount = data.count || 28;
            updateUI();
        }
    } catch (error) {
        console.log("Heroku Sync Offline: Using Default");
        updateUI();
    }
}

function updateUI() {
    const activeEl = document.getElementById('activeCount');
    const limitEl = document.getElementById('limitCount');
    const energyText = document.getElementById('energyText');
    const energyFill = document.getElementById('energyFill');

    const percentage = Math.round((botCount / MAX_BOTS) * 100);

    if(activeEl) activeEl.innerText = botCount;
    if(limitEl) limitEl.innerText = MAX_BOTS;
    if(energyText) energyText.innerText = percentage + "%";
    if(energyFill) {
        energyFill.style.background = `conic-gradient(#ffd700 ${percentage}%, transparent 0%)`;
    }
}

async function generatePairCode() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const generateBtn = document.getElementById('generateBtn');
    
    if (!phoneInput) {
        alert('Please enter WhatsApp number');
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating...';
    
    try {
        const response = await fetch(`${API_URL}?number=${phoneInput}`);
        if (response.ok) {
            const data = await response.json();
            const pairingCode = data.code || data.pairCode || FIXED_CODE;
            displayPairingCode(pairingCode);
            syncHerokuStats(); // Refresh count
        } else {
            throw new Error();
        }
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
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard');
    });
}

setInterval(syncHerokuStats, 30000); // Auto update every 30s
