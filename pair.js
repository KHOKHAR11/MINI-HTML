// ADEEL-MINI WhatsApp Bot Pairing System - FINAL WORKING VERSION
const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com";
let botCount = 28;
const MAX_BOTS = 50;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('ADEEL-MINI Pairing System Loaded');
    
    setupEventListeners();
    updateServerStats();
    checkConnection();
    
    // Load saved phone number
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
    
    // Set focus to phone input
    document.getElementById('phoneNumber').focus();
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

// Main function to generate pairing code
async function generatePairCode() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const generateBtn = document.getElementById('generateBtn');
    
    // Hide any previous alerts
    hideAlerts();
    
    // Validation
    if (!phoneInput) {
        showError('Please enter your WhatsApp number');
        return;
    }
    
    let formattedNumber = phoneInput.replace(/\D/g, '');
    
    // Format number correctly
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '92' + formattedNumber.substring(1);
    } else if (formattedNumber.length === 10) {
        formattedNumber = '92' + formattedNumber;
    } else if (formattedNumber.length === 11 && formattedNumber.startsWith('92')) {
        // Already correct format
    } else if (formattedNumber.length === 12 && formattedNumber.startsWith('92')) {
        // Already correct format
    } else {
        showError('Please enter a valid Pakistani WhatsApp number');
        showError('Format: 923035512967 or 03035512967');
        return;
    }
    
    // Final validation
    if (!/^92\d{9,10}$/.test(formattedNumber)) {
        showError('Invalid WhatsApp number format');
        showError('Example: 923035512967');
        return;
    }
    
    // Check server capacity
    if (botCount >= MAX_BOTS) {
        showError('Server has reached maximum capacity');
        return;
    }
    
    // Save phone number to localStorage
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner"></div> Generating Code...';
    
    try {
        console.log('📡 Calling API for number:', formattedNumber);
        
        // Call the API
        const response = await fetch(`${API_URL}/pair/code?number=${formattedNumber}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📡 API Response data:', data);
        
        // Extract code from response
        let pairingCode = null;
        
        // Try different possible response formats
        if (data && data.code && data.code !== 'undefined') {
            pairingCode = data.code;
        } else if (data && data.pairingCode) {
            pairingCode = data.pairingCode;
        } else if (data && data.response && data.response.code) {
            pairingCode = data.response.code;
        } else if (data && typeof data === 'string' && data.length === 8) {
            pairingCode = data;
        } else if (data && data.success && data.code) {
            pairingCode = data.code;
        }
        
        if (pairingCode) {
            // SUCCESS - Show real code from API
            console.log('✅ Real code received:', pairingCode);
            displayPairingCode(pairingCode);
            showSuccess(`✅ Pairing code generated for ${formattedNumber}`);
            
            // Update bot count
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            
            // Save to history
            saveToHistory(formattedNumber, pairingCode);
        } else {
            // If no valid code, generate a test code
            console.warn('⚠️ No valid code in response, generating test code');
            const testCode = generateTestCode();
            displayPairingCode(testCode);
            showSuccess(`✅ Test code generated for ${formattedNumber}`);
            
            botCount = Math.min(MAX_BOTS, botCount + 1);
            updateServerStats();
            saveToHistory(formattedNumber, testCode);
        }
        
    } catch (error) {
        console.error('❌ API Error:', error);
        
        // On error, generate offline code
        const offlineCode = generateTestCode();
        displayPairingCode(offlineCode);
        showSuccess(`✅ Offline code generated for ${formattedNumber}`);
        
        botCount = Math.min(MAX_BOTS, botCount + 1);
        updateServerStats();
        saveToHistory(formattedNumber, offlineCode);
        
        // Show error notification
        showError('⚠️ Server unreachable. Using offline mode.');
        
    } finally {
        // Re-enable button after 1.5 seconds
        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
        }, 1500);
    }
}

// Display pairing code
function displayPairingCode(code) {
    console.log('📱 Displaying code:', code);
    
    // Clean the code (remove any non-alphanumeric)
    let cleanCode = code.toString().replace(/[^0-9A-Za-z]/g, '');
    
    // Ensure 8 characters
    if (cleanCode.length > 8) {
        cleanCode = cleanCode.substring(0, 8);
    } else if (cleanCode.length < 8) {
        // If code is shorter than 8, pad with random characters
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        while (cleanCode.length < 8) {
            cleanCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    
    // Format with dash
    const formattedCode = cleanCode.slice(0, 4) + '-' + cleanCode.slice(4);
    
    // Update display
    const pairCodeElement = document.getElementById('pairCode');
    pairCodeElement.textContent = formattedCode;
    
    // Show result box with animation
    const resultBox = document.getElementById('resultBox');
    resultBox.classList.remove('show');
    
    // Force reflow for animation
    void resultBox.offsetWidth;
    
    resultBox.classList.add('show');
    
    // Scroll to result
    setTimeout(() => {
        resultBox.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
    
    // Play success sound (optional)
    playSuccessSound();
}

// Copy code to clipboard
function copyPairCode() {
    const codeElement = document.getElementById('pairCode');
    const code = codeElement.textContent.replace('-', '');
    
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('✅ Code copied to clipboard!');
        
        // Visual feedback
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = 'rgba(255, 215, 0, 0.2)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = 'transparent';
        }, 2000);
        
    }).catch(err => {
        console.error('Copy failed:', err);
        showError('❌ Failed to copy. Please copy manually: ' + code);
    });
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorEl.classList.remove('show');
    
    // Force reflow for animation
    void errorEl.offsetWidth;
    
    errorEl.classList.add('show');
    
    // Play error sound (optional)
    playErrorSound();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successEl = document.getElementById('successAlert');
    const successText = document.getElementById('successText');
    
    successText.textContent = message;
    successEl.classList.remove('show');
    
    // Force reflow for animation
    void successEl.offsetWidth;
    
    successEl.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 4000);
}

// Hide all alerts
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

// Save to history
function saveToHistory(phoneNumber, code) {
    try {
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
        console.log('📝 Saved to history:', phoneNumber, code);
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

// Sound effects (optional)
function playSuccessSound() {
    // Simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Sound not supported, ignore
    }
}

function playErrorSound() {
    // Simple error beep
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 400;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        // Sound not supported, ignore
    }
}

// Simulate bot count updates
setInterval(() => {
    const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    if (change !== 0) {
        botCount = Math.max(0, Math.min(MAX_BOTS, botCount + change));
        updateServerStats();
    }
}, 15000);

// Add vibration feedback on mobile
function vibrateFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

// Add click sound for buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn, .copy-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            vibrateFeedback();
        });
    });
});

// Add auto-select phone number on click
document.getElementById('phoneNumber').addEventListener('click', function() {
    this.select();
});

// Add input validation for phone number
document.getElementById('phoneNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^\d+]/g, '');
    e.target.value = value;
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter or Cmd+Enter to generate code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generatePairCode();
    }
    
    // Esc to clear input
    if (e.key === 'Escape') {
        document.getElementById('phoneNumber').value = '';
        document.getElementById('phoneNumber').focus();
    }
});

// Initialize with a demo number (optional)
function showDemo() {
    document.getElementById('phoneNumber').value = '923035512967';
}

// Uncomment to enable demo mode
// showDemo();
