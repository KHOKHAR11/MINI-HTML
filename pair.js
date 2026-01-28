// ADEEL-MINI WhatsApp Bot Pairing System
// Single Server - Real API Only

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
        const response = await fetch(API_URL.replace('/code', '/ping'));
        if (response.ok) {
            statusElement.innerHTML = '<span style="color:#00ff00">✅ Server Connected</span>';
        } else {
            statusElement.innerHTML = '<span style="color:#ff9900">⚠️ Server Slow</span>';
        }
    } catch (error) {
        statusElement.innerHTML = '<span style="color:#ff4d4d">❌ Connection Error</span>';
    }
}

// Generate pairing code - REAL API CALL
async function generatePairCode() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.innerHTML;
    
    // Validation
    if (!phoneInput) {
        showError('Please enter your WhatsApp number');
        return;
    }
    
    // Format phone number
    let formattedNumber = phoneInput;
    
    // If number is short (without country code), add 92
    if (phoneInput.length <= 11 && !phoneInput.startsWith('92')) {
        formattedNumber = '92' + phoneInput;
    }
    
    // Remove any non-digits
    formattedNumber = formattedNumber.replace(/\D/g, '');
    
    // Validate format
    if (!/^92\d{10}$/.test(formattedNumber)) {
        showError('Please enter a valid WhatsApp number (e.g., 923035512967 or 3035512967)');
        return;
    }
    
    // Check server capacity
    if (botCount >= MAX_BOTS) {
        showError('Server has reached maximum capacity. Please try again later.');
        return;
    }
    
    // Save phone number
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner"></div> Connecting...';
    
    try {
        // CALL REAL HEROKU API
        const response = await fetch(`${API_URL}?number=${formattedNumber}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code) {
            // SUCCESS - Show real code from API
            displayPairingCode(data.code);
            showSuccess('Pairing code generated successfully!');
            
            // Update bot count
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            
            // Save to history
            saveToHistory(formattedNumber, data.code);
        } else {
            throw new Error(data.error || 'Failed to generate code');
        }
        
    } catch (error) {
        console.error('API Error:', error);
        showError('Failed to connect to server. Please try again.');
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
    }
}

// Display pairing code
function displayPairingCode(code) {
    // Format code if needed (4-4 format)
    let formattedCode = code;
    if (code.length === 8 && !code.includes('-')) {
        formattedCode = code.slice(0, 4) + '-' + code.slice(4);
    }
    
    // Update display
    document.getElementById('pairCode').textContent = formattedCode;
    document.getElementById('resultBox').classList.add('show');
    
    // Scroll to result
    document.getElementById('resultBox').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
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

// Save to history
function saveToHistory(phoneNumber, code) {
    let history = JSON.parse(localStorage.getItem('adeelmini_history') || '[]');
    
    history.unshift({
        phone: phoneNumber,
        code: code,
        time: new Date().toLocaleString()
    });
    
    // Keep only last 50 records
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('adeelmini_history', JSON.stringify(history));
}

// Simulate bot count updates (for demo)
setInterval(() => {
    // Small random fluctuation
    const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (change !== 0) {
        botCount = Math.max(0, Math.min(MAX_BOTS, botCount + change));
        updateServerStats();
    }
}, 10000);
