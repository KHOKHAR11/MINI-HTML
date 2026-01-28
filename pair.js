const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
let botCount = 28; // Default starting count
const MAX_BOTS = 50;
const FIXED_CODE = "ADEEL1MD";

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateServerStats(); // Initialize UI
    syncWithHeroku();    // Fetch live data from API
    
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
});

// --- FETCH LIVE COUNT FROM API ---
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
        console.error("Heroku Sync Error: Using local state");
        updateServerStats();
    }
}

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const phoneInput = document.getElementById('phoneNumber');
    const copyBtn = document.getElementById('copyBtn');
    
    if(generateBtn) generateBtn.addEventListener('click', generatePairCode);
    if(copyBtn) copyBtn.addEventListener('click', copyPairCode);
    
    if(phoneInput) {
        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') generatePairCode();
        });
    }
}

function updateServerStats() {
    // Matching your HTML IDs: activeCount, limitCount, energyText, energyFill
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
    
    if (!phoneInput) {
        alert('Please enter WhatsApp number');
        return;
    }
    
    // Original Formatting Logic
    let formattedNumber = phoneInput.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '92' + formattedNumber.substring(1);
    } else if (formattedNumber.length === 10) {
        formattedNumber = '92' + formattedNumber;
    }
    
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner"></div> Generating...';
    
    try {
        const response = await fetch(`${API_URL}?number=${formattedNumber}`);

        if (response.ok) {
            const data = await response.json();
            const pairingCode = data.code || data.pairCode || FIXED_CODE;
            displayPairingCode(pairingCode);
            
            // Refresh count after new bot is added
            syncWithHeroku();
        } else {
            throw new Error('API Error');
        }
        
    } catch (error) {
        displayPairingCode(FIXED_CODE);
    } finally {
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
        }, 1500);
    }
}

function displayPairingCode(code) {
    const pairCodeEl = document.getElementById('pairCode');
    const resultBox = document.getElementById('resultBox');
    if (pairCodeEl) pairCodeEl.textContent = code;
    if (resultBox) resultBox.classList.add('show');
}

function copyPairCode() {
    const pairCodeEl = document.getElementById('pairCode');
    if (!pairCodeEl) return;
    
    navigator.clipboard.writeText(pairCodeEl.textContent).then(() => {
        alert('Code copied to clipboard');
    });
}

// Auto-refresh stats every 30 seconds
setInterval(syncWithHeroku, 30000);
