let currentServer = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";

function selectServer(element, url) {
    document.querySelectorAll('.server-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    currentServer = url;
}

async function generateCode() {
    const number = document.getElementById('phoneNumber').value.trim();
    const resultBox = document.getElementById('resultBox');
    const pairCodeDisplay = document.getElementById('pairCode');

    if (!number) {
        alert("Please enter number!");
        return;
    }

    resultBox.style.display = "block";
    pairCodeDisplay.innerText = "LOADING...";

    try {
        const response = await fetch(`${currentServer}?number=${number}`);
        const data = await response.json();
        
        if (data.code || data.pairCode) {
            pairCodeDisplay.innerText = data.code || data.pairCode;
        } else {
            pairCodeDisplay.innerText = "ERROR";
        }
    } catch (error) {
        pairCodeDisplay.innerText = "OFFLINE";
    }
}

function copyCode() {
    const code = document.getElementById('pairCode').innerText;
    navigator.clipboard.writeText(code);
    alert("Code Copied: " + code);
}
