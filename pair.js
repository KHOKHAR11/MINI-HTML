const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
let botCount = 28;
const MAX_BOTS = 50;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateServerStats();
    checkConnection();
    
    // Load saved phone number
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
});

// Setup event listeners
function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const phoneInput = document.getElementById('phoneNumber');
    const copyBtn = document.getElementById('copyBtn');
    
    generateBtn.addEventListener('click', generatePairCode);
    copyBtn.addEventListener('click', copyPairCode);
    
    // Allow Enter key to generate code
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generatePairCode();
        }
    });
}

// Update server statistics display
function updateServerStats() {
    document.getElementById('activeBots').textContent = botCount;
    document.getElementById('serverLimit').textContent = MAX_BOTS;
    
    // Update energy percentage
    const energyPercent = Math.round((botCount / MAX_BOTS) * 100);
    document.getElementById('energyPercent').textContent = energyPercent + '%';
    
    // Update status dot color
    const statusDot = document.getElementById('serverStatusDot');
    if (botCount >= MAX_BOTS) {
        statusDot.style.color = '#ff4d4d';
    } else if (botCount >= MAX_BOTS * 0.8) {
        statusDot.style.color = '#ff9900';
    } else {
        statusDot.style.color = '#00ff00';
    }
}

// Check connection to server
async function checkConnection() {
    const statusElement = document.getElementById('connectionStatus');
    
    try {
        const response = await fetch('https://adeel-mini-c947a70d0ed8.herokuapp.com/ping');
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
    
    if (formattedNumber.length === 10) {
        formattedNumber = '92' + formattedNumber;
    }
    
    if (!/^92\d{10}$/.test(formattedNumber)) {
        showError('Please enter a valid WhatsApp number');
        showError('Example: 923035512967');
        return;
    }
    
    // Check server capacity
    if (botCount >= MAX_BOTS) {
        showError('Server has reached maximum capacity');
        return;
    }
    
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner"></div> Connecting to WhatsApp...';
    
    try {
        console.log('Calling API with number:', formattedNumber);
        
        const response = await fetch(`${API_URL}?number=${formattedNumber}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            timeout: 30000 // 30 seconds timeout
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.code && data.code !== 'undefined') {
            // SUCCESS - Show real code from API
            displayPairingCode(data.code);
            showSuccess(`Code generated for ${formattedNumber}`);
            
            // Update bot count
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            
            // Save to history
            saveToHistory(formattedNumber, data.code);
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('No code received from server');
        }
        
    } catch (error) {
        console.error('API Error:', error);
        showError('Failed to generate code: ' + error.message);
        
        setTimeout(() => {
            const testCode = generateTestCode();
            displayPairingCode(testCode);
            showSuccess(`Test code generated for ${formattedNumber}`);
            
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            saveToHistory(formattedNumber, testCode);
        }, 1000);
        
    } finally {
        // Re-enable button
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
        }, 1000);
    }
}

// Display pairing code
function displayPairingCode(code) {
    
    let formattedCode = code;
    if (code.length === 8 && !code.includes('-')) {
        formattedCode = code.slice(0, 4) + '-' + code.slice(4);
    }
    
    // Update display
    document.getElementById('pairCode').textContent = formattedCode;
    document.getElementById('resultBox').classList.add('show');
    
    // Scroll to result
    setTimeout(() => {
        document.getElementById('resultBox').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

// Copy code to clipboard
function copyPairCode() {
    const code = document.getElementById('pairCode').textContent.replace('-', '');
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Code copied to clipboard!');
        
        // Visual feedback
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

// Show error message
function showError(message) {
    const errorEl = document.getElementById('errorAlert');
    document.getElementById('errorText').textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 5000);
}

// Show success message
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

// Generate test code (fallback)
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
    
    // Keep only last 50 records
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('adeelmini_history', JSON.stringify(history));
}

function formatPhoneNumber(phone) {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Check if it's already in international format
    if (cleaned.startsWith('92') && cleaned.length === 12) {
        return cleaned;
    }
    
    // If it's 10 digits, add 92
    if (cleaned.length === 10) {
        return '92' + cleaned;
    }
    
    // If it's 11 digits and starts with 0, replace 0 with 92
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return '92' + cleaned.substring(1);
    }
    
    return cleaned;
}

// Simulate bot count updates
setInterval(() => {
    // Small random fluctuation
    const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (change !== 0) {
        botCount = Math.max(0, Math.min(MAX_BOTS, botCount + change));
        updateServerStats();
    }
}, 15000);
