const API_URL = "https://adeel-mini-c947a70d0ed8.herokuapp.com/code";
let botCount = 28;
const MAX_BOTS = 50;
const FIXED_CODE = "ADEEL1MD";

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    const savedPhone = localStorage.getItem('adeelmini_phone');
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
});

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const phoneInput = document.getElementById('phoneNumber');
    const copyBtn = document.getElementById('copyBtn');
    
    if(generateBtn) generateBtn.addEventListener('click', generatePairCode);
    if(copyBtn) copyBtn.addEventListener('click', copyPairCode);
    
    if(phoneInput) {
        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') generatePairCode();
        });
    }
}

async function generatePairCode() {
    const phoneInputEl = document.getElementById('phoneNumber');
    const generateBtn = document.getElementById('generateBtn');
    const resultBox = document.getElementById('resultBox');
    const pairCodeEl = document.getElementById('pairCode');

    const phoneInput = phoneInputEl.value.trim();
    
    if (!phoneInput) {
        alert('Please enter WhatsApp number');
        return;
    }
    
    let formattedNumber = phoneInput.replace(/\D/g, '');
    
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '92' + formattedNumber.substring(1);
    } else if (formattedNumber.length === 10) {
        formattedNumber = '92' + formattedNumber;
    }
    
    localStorage.setItem('adeelmini_phone', phoneInput);
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating...';
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${API_URL}?number=${formattedNumber}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const code = data.code || data.pairCode || FIXED_CODE;
            displayPairingCode(code);
        } else {
            throw new Error('API Error');
        }
        
    } catch (error) {
        console.log("Using Fallback Code");
        displayPairingCode(FIXED_CODE);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate Now';
    }
}

function displayPairingCode(code) {
    const pairCodeEl = document.getElementById('pairCode');
    const resultBox = document.getElementById('resultBox');
    
    let cleanCode = code.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formattedCode = cleanCode.slice(0, 4) + '-' + cleanCode.slice(4, 8);
    
    if (pairCodeEl) pairCodeEl.textContent = formattedCode;
    if (resultBox) resultBox.classList.add('show');
}

function copyPairCode() {
    const pairCodeEl = document.getElementById('pairCode');
    const code = pairCodeEl.textContent.replace('-', '');
    
    navigator.clipboard.writeText(code).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const oldText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => copyBtn.innerText = oldText, 2000);
    });
}
