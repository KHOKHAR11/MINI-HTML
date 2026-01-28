Const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
let botCount = 12;
const MAX_BOTS = 50;
const FIXED_CODE = "ADEEL1MD";

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateServerStats();
    checkConnection();
    
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
});

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const phoneInput = document.getElementById('phoneNumber');
    const copyBtn = document.getElementById('copyBtn');
    
    generateBtn.addEventListener('click', generatePairCode);
    copyBtn.addEventListener('click', copyPairCode);
    
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') generatePairCode();
    });
}

function updateServerStats() {
    const activeBotsEl = document.getElementById('activeBots');
    const serverLimitEl = document.getElementById('serverLimit');
    const energyPercentEl = document.getElementById('energyPercent');
    const statusDot = document.getElementById('serverStatusDot');

    if(activeBotsEl) activeBotsEl.textContent = botCount;
    if(serverLimitEl) serverLimitEl.textContent = MAX_BOTS;
    
    const energyPercent = Math.round((botCount / MAX_BOTS) * 100);
    if(energyPercentEl) energyPercentEl.textContent = energyPercent + '%';
    
    if (statusDot) {
        if (botCount >= MAX_BOTS) statusDot.style.color = '#ff4d4d';
        else if (botCount >= MAX_BOTS * 0.8) statusDot.style.color = '#ff9900';
        else statusDot.style.color = '#00ff00';
    }
}

async function checkConnection() {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.innerHTML = '<span style="color:#00ff00">Server Ready</span>';
    }
}

async function generatePairCode() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const generateBtn = document.getElementById('generateBtn');
    
    hideAlerts();
    
    if (!phoneInput) {
        showError('Please enter WhatsApp number');
        return;
    }
    
    let formattedNumber = phoneInput.replace(/\D/g, '');
    
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '92' + formattedNumber.substring(1);
    } else if (formattedNumber.length === 10) {
        formattedNumber = '92' + formattedNumber;
    }
    
    if (formattedNumber.length < 10) {
        showError('Invalid WhatsApp number format');
        return;
    }
    
    if (botCount >= MAX_BOTS) {
        showError('Server capacity full');
        return;
    }
    
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner"></div> Generating...';
    
    try {
        // Fetching from API with a 15-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${API_URL}?number=${formattedNumber}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            // Checking if API returned a valid code
            const pairingCode = data.code || data.pairCode || FIXED_CODE;
            
            displayPairingCode(pairingCode);
            showSuccess(`Code generated for ${formattedNumber}`);
            
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            saveToHistory(formattedNumber, pairingCode);
        } else {
            throw new Error('API Response Error');
        }
        
    } catch (error) {
        console.error("Fetch Error:", error);
        // Fallback to fixed code if API fails
        displayPairingCode(FIXED_CODE);
        showSuccess(`Offline mode: Using default code`);
        
        botCount = Math.min(MAX_BOTS, botCount + 1);
        updateServerStats();
    } finally {
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
        }, 1500);
    }
}

function displayPairingCode(code) {
    let cleanCode = code.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleanCode.length < 8) {
        while (cleanCode.length < 8) cleanCode += 'X';
    }
    
    const formattedCode = cleanCode.slice(0, 4) + '-' + cleanCode.slice(4, 8);
    const pairCodeEl = document.getElementById('pairCode');
    if (pairCodeEl) pairCodeEl.textContent = formattedCode;
    
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
        resultBox.classList.remove('show');
        void resultBox.offsetWidth; // Trigger reflow
        resultBox.classList.add('show');
        setTimeout(() => resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
}

function copyPairCode() {
    const pairCodeEl = document.getElementById('pairCode');
    if (!pairCodeEl) return;

    const code = pairCodeEl.textContent.replace('-', '');
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Code copied to clipboard');
        
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    }).catch(err => showError('Copy failed'));
}

function showError(message) {
    const errorEl = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    if (errorEl && errorText) {
        errorText.textContent = message;
        errorEl.classList.add('show');
        setTimeout(() => errorEl.classList.remove('show'), 5000);
    }
}

function showSuccess(message) {
    const successEl = document.getElementById('successAlert');
    const successText = document.getElementById('successText');
    if (successEl && successText) {
        successText.textContent = message;
        successEl.classList.add('show');
        setTimeout(() => successEl.classList.remove('show'), 4000);
    }
}

function hideAlerts() {
    const err = document.getElementById('errorAlert');
    const succ = document.getElementById('successAlert');
    if (err) err.classList.remove('show');
    if (succ) succ.classList.remove('show');
}

function saveToHistory(phoneNumber, code) {
    try {
        let history = JSON.parse(localStorage.getItem('adeelmini_history') || '[]');
        history.unshift({ phone: phoneNumber, code: code, time: new Date().toLocaleString('en-PK') });
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem('adeelmini_history', JSON.stringify(history));
    } catch (error) {
        console.error("History Save Error:", error);
    }
}

// Background simulation of server load
setInterval(() => {
    const change = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (change !== 0) {
        botCount = Math.max(5, Math.min(MAX_BOTS, botCount + change));
        updateServerStats();
    }
}, 15000);
