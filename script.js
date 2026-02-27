async function getPairCode() {
    const phone = document.getElementById('phoneNumber').value.trim();
    const serverUrl = document.getElementById('serverSelect').value;
    const btn = document.getElementById('generateBtn');
    const resultBox = document.getElementById('resultBox');
    const pairCodeDisplay = document.getElementById('pairCode');

    if (!phone) {
        alert("Please enter a valid number!");
        return;
    }

    btn.innerText = "Connecting...";
    btn.disabled = true;

    try {
        // Calling the selected server
        const response = await fetch(`${serverUrl}?number=${phone}`);
        const data = await response.json();

        if (data.code || data.pairCode) {
            const code = data.code || data.pairCode;
            pairCodeDisplay.innerText = code;
            resultBox.classList.add('show');
        } else {
            alert("Server limit reached or error. Try another server.");
        }
    } catch (err) {
        console.error(err);
        alert("Connection Failed. Check your internet or server status.");
    } finally {
        btn.innerText = "Generate Code";
        btn.disabled = false;
    }
}

function copyCode() {
    const code = document.getElementById('pairCode').innerText;
    navigator.clipboard.writeText(code);
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.innerText = "Copied!";
    setTimeout(() => { copyBtn.innerText = "Copy Code"; }, 2000);
}
