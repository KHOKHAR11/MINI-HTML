const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
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
    document.getElementById('activeBots').textContent = botCount;
    document.getElementById('serverLimit').textContent = MAX_BOTS;
    
    const energyPercent = Math.round((botCount / MAX_BOTS) * 100);
    document.getElementById('energyPercent').textContent = energyPercent + '%';
    
    const statusDot = document.getElementById('serverStatusDot');
    if (botCount >= MAX_BOTS) statusDot.style.color = '#ff4d4d';
    else if (botCount >= MAX_BOTS * 0.8) statusDot.style.color = '#ff9900';
    else statusDot.style.color = '#00ff00';
}

async function checkConnection() {
    const statusElement = document.getElementById('connectionStatus');
    try {
        const response = await fetch(API_URL.replace('/code', '/ping'));
        if (response.ok) statusElement.innerHTML = '<span style="color:#00ff00">Server Connected</span>';
        else statusElement.innerHTML = '<span style="color:#ff9900">Server Slow</span>';
    } catch (error) {
        statusElement.innerHTML = '<span style="color:#ff4d4d">Connection Error</span>';
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
    
    if (formattedNumber.startsWith('0')) formattedNumber = '92' + formattedNumber.substring(1);
    else if (formattedNumber.length === 10) formattedNumber = '92' + formattedNumber;
    
    if (!/^92\d{10}$/.test(formattedNumber)) {
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
        const response = await fetch(`${API_URL}?number=${formattedNumber}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const pairingCode = FIXED_CODE;
        displayPairingCode(pairingCode);
        showSuccess(`Code for ${formattedNumber}`);
        
        botCount = Math.min(MAX_BOTS, botCount + 1);
        updateServerStats();
        saveToHistory(formattedNumber, pairingCode);
        
    } catch (error) {
        const pairingCode = FIXED_CODE;
        displayPairingCode(pairingCode);
        showSuccess(`Code for ${formattedNumber}`);
        
        botCount = Math.min(MAX_BOTS, botCount + 1);
        updateServerStats();
        saveToHistory(formattedNumber, pairingCode);
        
        showError('Server error, using fixed code');
        
    } finally {
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
        }, 1500);
    }
}

function displayPairingCode(code) {
    let cleanCode = code.toString().toUpperCase();
    
    if (cleanCode.length < 8) {
        while (cleanCode.length < 8) cleanCode += 'X';
    } else if (cleanCode.length > 8) cleanCode = cleanCode.substring(0, 8);
    
    const formattedCode = cleanCode.slice(0, 4) + '-' + cleanCode.slice(4);
    document.getElementById('pairCode').textContent = formattedCode;
    
    const resultBox = document.getElementById('resultBox');
    resultBox.classList.remove('show');
    void resultBox.offsetWidth;
    resultBox.classList.add('show');
    
    setTimeout(() => resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

function copyPairCode() {
    const code = document.getElementById('pairCode').textContent.replace('-', '');
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Code copied');
        
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    }).catch(err => showError('Copy failed'));
}

function showError(message) {
    const errorEl = document.getElementById('errorAlert');
    document.getElementById('errorText').textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => errorEl.classList.remove('show'), 5000);
}

function showSuccess(message) {
    const successEl = document.getElementById('successAlert');
    document.getElementById('successText').textContent = message;
    successEl.classList.add('show');
    setTimeout(() => successEl.classList.remove('show'), 4000);
}

function hideAlerts() {
    document.getElementById('errorAlert').classList.remove('show');
    document.getElementById('successAlert').classList.remove('show');
}

function saveToHistory(phoneNumber, code) {
    try {
        let history = JSON.parse(localStorage.getItem('adeelmini_history') || '[]');
        history.unshift({ phone: phoneNumber, code: code, time: new Date().toLocaleString('en-PK') });
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem('adeelmini_history', JSON.stringify(history));
    } catch (error) {}
}

setInterval(() => {
    const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (change !== 0) {
        botCount = Math.max(0, Math.min(MAX_BOTS, botCount + change));
        updateServerStats();
    }
}, 15000);
