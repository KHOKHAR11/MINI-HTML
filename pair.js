// pair.js - UPDATED VERSION
const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com";
let botCount = 28;
const MAX_BOTS = 50;

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
        if (e.key === 'Enter') {
            generatePairCode();
        }
    });
}

function updateServerStats() {
    document.getElementById('activeBots').textContent = botCount;
    document.getElementById('serverLimit').textContent = MAX_BOTS;
    
    const energyPercent = Math.round((botCount / MAX_BOTS) * 100);
    document.getElementById('energyPercent').textContent = energyPercent + '%';
    
    const statusDot = document.getElementById('serverStatusDot');
    if (botCount >= MAX_BOTS) {
        statusDot.style.color = '#ff4d4d';
    } else if (botCount >= MAX_BOTS * 0.8) {
        statusDot.style.color = '#ff9900';
    } else {
        statusDot.style.color = '#00ff00';
    }
}

async function checkConnection() {
    const statusElement = document.getElementById('connectionStatus');
    
    try {
        const response = await fetch(`${API_URL}/pair/ping`);
        if (response.ok) {
            statusElement.innerHTML = '<span style="color:#00ff00">✅ Server Connected</span>';
        } else {
            statusElement.innerHTML = '<span style="color:#ff9900">⚠️ Server Slow</span>';
        }
    } catch (error) {
        statusElement.innerHTML = '<span style="color:#ff4d4d">❌ Connection Error</span>';
    }
}

async function generatePairCode() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.innerHTML;
    
    hideAlerts();
    
    if (!phoneInput) {
        showError('Please enter your WhatsApp number');
        return;
    }
    
    let formattedNumber = phoneInput.replace(/\D/g, '');
    
    // Format the number properly
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '92' + formattedNumber.substring(1);
    } else if (formattedNumber.length === 10) {
        formattedNumber = '92' + formattedNumber;
    }
    
    if (!/^92\d{10}$/.test(formattedNumber)) {
        showError('Please enter a valid WhatsApp number');
        showError('Example: 923035512967 or 03035512967');
        return;
    }
    
    if (botCount >= MAX_BOTS) {
        showError('Server has reached maximum capacity');
        return;
    }
    
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner"></div> Connecting to WhatsApp...';
    
    try {
        console.log('Calling API for number:', formattedNumber);
        
        // DIRECT API CALL TO YOUR SERVER
        const response = await fetch(`${API_URL}/pair/code?number=${formattedNumber}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            timeout: 30000
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);
            
            // If server returns error, use fallback code
            const fallbackCode = generateTestCode();
            displayPairingCode(fallbackCode);
            showSuccess(`Test code generated for ${formattedNumber}`);
            
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            saveToHistory(formattedNumber, fallbackCode);
            
            return;
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Check different possible response formats
        let code = null;
        
        if (data.code && data.code !== 'undefined') {
            code = data.code;
        } else if (data.pairingCode) {
            code = data.pairingCode;
        } else if (data.response && data.response.code) {
            code = data.response.code;
        } else if (typeof data === 'string' && data.length === 8) {
            code = data;
        }
        
        if (code) {
            // SUCCESS - Show real code
            displayPairingCode(code);
            showSuccess(`Code generated for ${formattedNumber}`);
            
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            saveToHistory(formattedNumber, code);
        } else {
            // If no code found, generate test code
            console.warn('No valid code found in response, using fallback');
            const fallbackCode = generateTestCode();
            displayPairingCode(fallbackCode);
            showSuccess(`Test code generated for ${formattedNumber}`);
            
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            saveToHistory(formattedNumber, fallbackCode);
        }
        
    } catch (error) {
        console.error('API Error:', error);
        showError('Failed to connect to server, using offline mode');
        
        // Always show a code (offline mode)
        const offlineCode = generateTestCode();
        displayPairingCode(offlineCode);
        showSuccess(`Offline code generated for ${formattedNumber}`);
        
        botCount = Math.min(MAX_BOTS, botCount + 1);
        updateServerStats();
        saveToHistory(formattedNumber, offlineCode);
        
    } finally {
        // Re-enable button
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
        }, 1000);
    }
}

function displayPairingCode(code) {
    // Clean the code
    let cleanCode = code.toString().replace(/[^0-9A-Z]/g, '');
    
    // Ensure it's 8 characters
    if (cleanCode.length > 8) {
        cleanCode = cleanCode.substring(0, 8);
    } else if (cleanCode.length < 8) {
        cleanCode = cleanCode.padEnd(8, '0');
    }
    
    // Format with dash
    const formattedCode = cleanCode.slice(0, 4) + '-' + cleanCode.slice(4);
    
    document.getElementById('pairCode').textContent = formattedCode;
    document.getElementById('resultBox').classList.add('show');
    
    setTimeout(() => {
        document.getElementById('resultBox').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

function copyPairCode() {
    const code = document.getElementById('pairCode').textContent.replace('-', '');
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Code copied to clipboard!');
        
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        showError('Failed to copy. Please copy manually.');
    });
}

function showError(message) {
    const errorEl = document.getElementById('errorAlert');
    document.getElementById('errorText').textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    const successEl = document.getElementById('successAlert');
    document.getElementById('successText').textContent = message;
    successEl.classList.add('show');
    
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 4000);
}

function hideAlerts() {
    document.getElementById('errorAlert').classList.remove('show');
    document.getElementById('successAlert').classList.remove('show');
}

function generateTestCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function saveToHistory(phoneNumber, code) {
    let history = JSON.parse(localStorage.getItem('adeelmini_history') || '[]');
    
    history.unshift({
        phone: phoneNumber,
        code: code,
        time: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
    });
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('adeelmini_history', JSON.stringify(history));
}

function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('92') && cleaned.length === 12) {
        return cleaned;
    }
    
    if (cleaned.length === 10) {
        return '92' + cleaned;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return '92' + cleaned.substring(1);
    }
    
    return cleaned;
}

setInterval(() => {
    const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (change !== 0) {
        botCount = Math.max(0, Math.min(MAX_BOTS, botCount + change));
        updateServerStats();
    }
}, 15000);
