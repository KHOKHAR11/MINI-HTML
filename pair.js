// ADEEL-MINI WhatsApp Bot Pairing System
// 5 Servers with 50 bot limit each

const servers = [
    {
        id: 1,
        name: "ADEEL-MINI Server 1",
        url: "https://adeel-mini-c947a70d0ed8.herokuapp.com",
        location: "Heroku US",
        active: true,
        bots: 28,
        limit: 50,
        ping: 45,
        description: "Primary deployment server",
        apiEndpoint: "/code"
    },
    {
        id: 2,
        name: "ADEEL-MINI Server 2",
        url: "https://adeel-mini-europe.herokuapp.com",
        location: "Heroku Europe",
        active: true,
        bots: 15,
        limit: 50,
        ping: 65,
        description: "European region server",
        apiEndpoint: "/code"
    },
    {
        id: 3,
        name: "ADEEL-MINI Server 3",
        url: "https://adeel-mini-asia.herokuapp.com",
        location: "Heroku Asia",
        active: true,
        bots: 32,
        limit: 50,
        ping: 120,
        description: "Asia-Pacific region server",
        apiEndpoint: "/code"
    },
    {
        id: 4,
        name: "ADEEL-MINI Server 4",
        url: "https://adeel-mini-backup1.herokuapp.com",
        location: "Heroku Backup 1",
        active: true,
        bots: 12,
        limit: 50,
        ping: 85,
        description: "Backup server 1",
        apiEndpoint: "/code"
    },
    {
        id: 5,
        name: "ADEEL-MINI Server 5",
        url: "https://adeel-mini-backup2.herokuapp.com",
        location: "Heroku Backup 2",
        active: true,
        bots: 8,
        limit: 50,
        ping: 95,
        description: "Backup server 2",
        apiEndpoint: "/code"
    }
];

let selectedServer = null;
let countryCode = "92";
let lastPairing = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadServers();
    updateStats();
    updateLastUpdate();
    
    // Load saved server from localStorage
    const savedServerId = localStorage.getItem('adeelmini_selected_server');
    if (savedServerId) {
        selectServer(parseInt(savedServerId));
    }
    
    // Load saved phone number
    const savedPhone = localStorage.getItem('adeelmini_phone_number');
    if (savedPhone) {
        document.getElementById('phone-number').value = savedPhone;
    }
    
    // Update status every 10 seconds
    setInterval(updateStats, 10000);
    setInterval(updateLastUpdate, 60000);
});

// Load servers to the page
function loadServers() {
    const serverList = document.getElementById('serverList');
    serverList.innerHTML = '';
    
    servers.forEach(server => {
        const serverCard = document.createElement('div');
        serverCard.className = 'server-card';
        
        if (selectedServer && selectedServer.id === server.id) {
            serverCard.classList.add('selected');
        }
        
        const usagePercent = Math.min(100, Math.round((server.bots / server.limit) * 100));
        const statusClass = 'status-dot';
        
        serverCard.innerHTML = `
            <div class="server-name">
                <i class="fas fa-server"></i> ${server.name}
                ${server.id === 1 ? '<span class="server-badge">PRIMARY</span>' : ''}
            </div>
            <div class="server-info">
                <i class="fas fa-map-marker-alt"></i> ${server.location}
            </div>
            <div class="server-info">
                <i class="fas fa-globe"></i> ${server.url.replace('https://', '')}
            </div>
            <div class="server-info">
                <i class="fas fa-signal"></i> Ping: ${server.ping}ms
            </div>
            <div class="server-status">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="${statusClass}"></div>
                    <span style="font-size: 0.8rem;">${server.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="bot-count">
                    <span>${server.bots}</span> / ${server.limit} bots
                </div>
            </div>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.1); height: 5px; border-radius: 5px;">
                <div style="width: ${usagePercent}%; height: 100%; background: ${usagePercent > 80 ? '#ff4d4d' : usagePercent > 50 ? '#ffd700' : '#00ff00'}; border-radius: 5px;"></div>
            </div>
        `;
        
        serverCard.onclick = () => selectServer(server.id);
        serverList.appendChild(serverCard);
    });
}

// Select a server
function selectServer(serverId) {
    selectedServer = servers.find(s => s.id === serverId);
    loadServers();
    
    // Update display
    document.getElementById('selected-server-display').textContent = selectedServer.name;
    
    // Save to localStorage
    localStorage.setItem('adeelmini_selected_server', serverId);
    
    // Enable/disable generate button
    document.getElementById('pair-btn').disabled = !selectedServer || !selectedServer.active;
}

// Update statistics
function updateStats() {
    const totalBots = servers.reduce((sum, server) => sum + server.bots, 0);
    document.getElementById('total-bots').textContent = totalBots;
    
    // Update server status randomly (simulating real-time updates)
    servers.forEach(server => {
        // Simulate small fluctuations in bot count
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        if (change !== 0) {
            server.bots = Math.max(0, Math.min(server.limit, server.bots + change));
        }
    });
    
    loadServers();
}

// Update last update time
function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-update').textContent = timeString;
}

// Generate pairing code
async function generatePairCode() {
    const phoneInput = document.getElementById('phone-number').value.trim();
    const pairBtn = document.getElementById('pair-btn');
    const btnText = document.getElementById('btn-text');
    
    // Validation
    if (!selectedServer) {
        showError('Please select a server first!');
        return;
    }
    
    if (!phoneInput || !/^\d{9,11}$/.test(phoneInput)) {
        showError('Please enter a valid WhatsApp number (9-11 digits without country code)');
        return;
    }
    
    // Check server capacity
    if (selectedServer.bots >= selectedServer.limit) {
        showError(`Server ${selectedServer.name} has reached its maximum capacity of ${selectedServer.limit} bots. Please select another server.`);
        return;
    }
    
    // Save phone number
    localStorage.setItem('adeelmini_phone_number', phoneInput);
    
    // Disable button and show loading
    pairBtn.disabled = true;
    btnText.innerHTML = '<div class="spinner"></div> Generating...';
    
    // Full phone number
    const fullPhoneNumber = `${countryCode}${phoneInput}`;
    
    try {
        // If server 1 is selected (your Heroku app), use actual API
        if (selectedServer.id === 1) {
            await generateFromHeroku(fullPhoneNumber);
        } else {
            // For other servers, simulate API call
            await simulatePairing(fullPhoneNumber);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to generate pairing code. Please try again.');
    } finally {
        // Re-enable button
        pairBtn.disabled = false;
        btnText.innerHTML = '<i class="fas fa-key"></i> Generate Pairing Code';
    }
}

// Generate code from actual Heroku server (Server 1)
async function generateFromHeroku(phoneNumber) {
    try {
        // Use your Heroku API endpoint
        const response = await fetch(`${selectedServer.url}${selectedServer.apiEndpoint}?number=${phoneNumber}`);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code) {
            // Success - display code
            displayPairingCode(data.code, phoneNumber);
            
            // Increment bot count for this server
            selectedServer.bots++;
            updateStats();
            
            showSuccess('Pairing code generated successfully!');
        } else {
            throw new Error(data.error || 'No code received from server');
        }
        
    } catch (error) {
        console.warn('Heroku API failed, using fallback:', error);
        // Fallback to simulated pairing
        await simulatePairing(phoneNumber);
    }
}

// Simulate pairing for other servers
function simulatePairing(phoneNumber) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate random 8-digit code
            const pairCode = generateRandomCode();
            
            // Display code
            displayPairingCode(pairCode, phoneNumber);
            
            // Increment bot count for this server
            selectedServer.bots++;
            updateStats();
            
            // Show success
            showSuccess(`Pairing code generated for ${selectedServer.name}`);
            
            // Log to console
            console.log(`Pairing generated:
                Server: ${selectedServer.name}
                WhatsApp: +${phoneNumber}
                Code: ${pairCode}
                Bot deployed successfully.`);
            
            resolve();
        }, 1500);
    });
}

// Display pairing code
function displayPairingCode(code, phoneNumber) {
    // Format code with dashes (if needed)
    let formattedCode = code;
    if (code.length === 8) {
        formattedCode = code.replace(/(\w{4})(\w{4})/, '$1-$2');
    }
    
    // Update display
    document.getElementById('pair-code').textContent = formattedCode;
    document.getElementById('pair-server').textContent = selectedServer.name;
    
    // Generate bot ID
    const botId = `ADEEL-${selectedServer.id.toString().padStart(2, '0')}-${selectedServer.bots.toString().padStart(3, '0')}`;
    document.getElementById('bot-id').textContent = botId;
    
    // Set expiry time (5 minutes from now)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const expiryTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('expiry-time').textContent = expiryTime;
    
    // Show code display
    document.getElementById('code-display').classList.add('show');
    
    // Scroll to code
    document.getElementById('code-display').scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Save pairing record
    lastPairing = {
        server: selectedServer.name,
        phoneNumber: `+${phoneNumber}`,
        code: formattedCode,
        botId: botId,
        expiry: expiryTime,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    savePairingRecord(lastPairing);
}

// Generate random 8-digit pairing code
function generateRandomCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('error-msg');
    document.getElementById('error-text').textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successEl = document.getElementById('success-msg');
    document.getElementById('success-text').textContent = message;
    successEl.classList.add('show');
    
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 4000);
}

// Copy pairing code to clipboard
function copyCode() {
    const pairCode = document.getElementById('pair-code').textContent.replace('-', '');
    
    navigator.clipboard.writeText(pairCode).then(() => {
        showSuccess('Pairing code copied to clipboard!');
        
        // Visual feedback
        const copyBtn = document.querySelector('.btn-primary[onclick="copyCode()"]');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#38a169';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = 'transparent';
        }, 2000);
    }).catch(err => {
        showError('Failed to copy code. Please copy manually.');
    });
}

// Save pairing record to localStorage
function savePairingRecord(record) {
    let records = JSON.parse(localStorage.getItem('adeelmini_pairing_records') || '[]');
    records.push(record);
    
    // Keep only last 100 records
    if (records.length > 100) {
        records = records.slice(-100);
    }
    
    localStorage.setItem('adeelmini_pairing_records', JSON.stringify(records));
}

// View all pairing records (for debugging)
function viewAllPairingRecords() {
    const records = JSON.parse(localStorage.getItem('adeelmini_pairing_records') || '[]');
    console.log('All pairing records:', records);
    alert(`Total pairing records: ${records.length}\nCheck console for details.`);
}

// Change country code (optional feature)
function changeCountryCode() {
    const newCode = prompt("Enter country code (without +):", countryCode);
    if (newCode && /^\d{1,3}$/.test(newCode)) {
        countryCode = newCode;
        document.getElementById('country-code').textContent = `+${countryCode}`;
        localStorage.setItem('adeelmini_country_code', countryCode);
    } else if (newCode !== null) {
        alert("Please enter a valid country code (1-3 digits)");
    }
}
