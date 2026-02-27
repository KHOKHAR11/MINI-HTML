let currentUrl = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";

function toggleServers() {
    document.getElementById('serversList').classList.toggle('open');
}

function setServer(id, url, active, limit) {
    // UI Update
    currentUrl = url;
    document.getElementById('selectedServerName').innerText = "Server " + id;
    
    // Highlight active item
    document.querySelectorAll('.server-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Close menu after selection
    setTimeout(() => toggleServers(), 200);
}

async function generatePairCode() {
    const number = document.getElementById('phoneNumber').value.trim();
    if (!number) return alert("Enter Number!");

    const codeDisplay = document.getElementById('pairCode');
    const resBox = document.getElementById('resultBox');
    
    resBox.style.display = "block";
    codeDisplay.innerText = "LOADING...";

    try {
        const response = await fetch(`${currentUrl}?number=${number}`);
        const data = await response.json();
        codeDisplay.innerText = data.code || data.pairCode || "ERROR";
        
        // یہاں آپ کا کاؤنٹر بڑھانے کا لاجک آئے گا اگر API سپورٹ کرے
    } catch (e) {
        codeDisplay.innerText = "OFFLINE";
    }
}
