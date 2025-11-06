// TOTP Token Generator
// Uses @otplib/preset-browser library loaded from CDN

// DOM elements
const secretKeyInput = document.getElementById('secret-key');
const digitsSelect = document.getElementById('digits');
const periodSelect = document.getElementById('period');
const tokenDisplay = document.getElementById('token');
const countdownDisplay = document.getElementById('updating-in');
const themeToggle = document.getElementById('theme-toggle');

// State
let updateInterval = null;
let countdownInterval = null;
let currentPeriod = 30;

// Initialize - wait for both DOM and otplib library to be ready
function initializeApp() {
    // Check if otplib is loaded
    const otplibInstance = window.otplib || (typeof otplib !== 'undefined' ? otplib : null);
    if (!otplibInstance || !otplibInstance.authenticator) {
        // Retry after a short delay if library isn't loaded yet
        setTimeout(initializeApp, 100);
        return;
    }
    
    // Load saved secret key from localStorage
    const savedSecret = localStorage.getItem('totp-secret-key');
    if (savedSecret) {
        secretKeyInput.value = savedSecret;
    }
    
    // Load saved preferences
    const savedDigits = localStorage.getItem('totp-digits');
    if (savedDigits) {
        digitsSelect.value = savedDigits;
    }
    
    const savedPeriod = localStorage.getItem('totp-period');
    if (savedPeriod) {
        periodSelect.value = savedPeriod;
        currentPeriod = parseInt(savedPeriod);
    }
    
    // Initialize dark mode
    initDarkMode();
    
    // Start token generation if secret key exists
    if (secretKeyInput.value) {
        generateToken();
        startCountdown();
    }
    
    // Event listeners
    secretKeyInput.addEventListener('input', handleSecretKeyChange);
    digitsSelect.addEventListener('change', handleConfigChange);
    periodSelect.addEventListener('change', handlePeriodChange);
    themeToggle.addEventListener('click', toggleDarkMode);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

// Handle secret key input change
function handleSecretKeyChange() {
    const secret = secretKeyInput.value.trim();
    
    // Save to localStorage
    if (secret) {
        localStorage.setItem('totp-secret-key', secret);
    } else {
        localStorage.removeItem('totp-secret-key');
    }
    
    // Validate and generate token
    if (secret && isValidSecret(secret)) {
        generateToken();
        startCountdown();
    } else {
        tokenDisplay.textContent = '------';
        countdownDisplay.textContent = currentPeriod;
        stopCountdown();
    }
}

// Handle configuration changes
function handleConfigChange() {
    const digits = digitsSelect.value;
    localStorage.setItem('totp-digits', digits);
    
    if (secretKeyInput.value.trim() && isValidSecret(secretKeyInput.value.trim())) {
        generateToken();
    }
}

// Handle period change
function handlePeriodChange() {
    currentPeriod = parseInt(periodSelect.value);
    localStorage.setItem('totp-period', currentPeriod.toString());
    
    if (secretKeyInput.value.trim() && isValidSecret(secretKeyInput.value.trim())) {
        generateToken();
        startCountdown();
    }
}

// Validate secret key format (base32 or hex)
function isValidSecret(secret) {
    // Remove spaces and hyphens for validation
    const cleaned = secret.replace(/[\s-]/g, '').toUpperCase();
    
    // Check if it's valid base32 (A-Z, 2-7) or hex (0-9, A-F)
    const base32Pattern = /^[A-Z2-7]+$/;
    const hexPattern = /^[0-9A-F]+$/;
    
    return base32Pattern.test(cleaned) || hexPattern.test(cleaned);
}

// Generate TOTP token
function generateToken() {
    const secret = secretKeyInput.value.trim();
    
    if (!secret || !isValidSecret(secret)) {
        tokenDisplay.textContent = '------';
        return;
    }
    
    // Check if otplib is loaded
    const otplibInstance = window.otplib || (typeof otplib !== 'undefined' ? otplib : null);
    if (!otplibInstance || !otplibInstance.authenticator) {
        console.error('otplib library not loaded');
        tokenDisplay.textContent = 'LIB ERROR';
        return;
    }
    
    try {
        const digits = parseInt(digitsSelect.value);
        const period = parseInt(periodSelect.value);
        
        // Clean the secret (remove spaces, hyphens, convert to uppercase)
        const cleanedSecret = secret.replace(/[\s-]/g, '').toUpperCase();
        
        // Generate token using otplib
        const token = otplibInstance.authenticator.generate(cleanedSecret, {
            digits: digits,
            step: period
        });
        
        // Format token with spaces for readability (every 3 digits)
        const formattedToken = formatToken(token, digits);
        tokenDisplay.textContent = formattedToken;
    } catch (error) {
        console.error('Error generating token:', error);
        tokenDisplay.textContent = 'ERROR';
    }
}

// Format token with spaces for readability
function formatToken(token, digits) {
    if (digits === 6) {
        return token.substring(0, 3) + ' ' + token.substring(3);
    } else if (digits === 8) {
        return token.substring(0, 4) + ' ' + token.substring(4);
    }
    return token;
}

// Start countdown timer
function startCountdown() {
    stopCountdown();
    
    const period = parseInt(periodSelect.value);
    currentPeriod = period;
    
    // Calculate time remaining in current period
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = period - (now % period);
    
    countdownDisplay.textContent = timeRemaining;
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = period - (now % period);
        countdownDisplay.textContent = timeRemaining;
        
        // Regenerate token when period resets
        if (timeRemaining === period) {
            generateToken();
        }
    }, 1000);
    
    // Generate token immediately
    generateToken();
}

// Stop countdown timer
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Dark mode functionality
function initDarkMode() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-mode');
    }
    
    updateThemeIcon();
}

function toggleDarkMode() {
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
    
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('svg');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Update icon path based on theme
    const path = icon.querySelector('path');
    if (isDark) {
        // Sun icon for dark mode (to switch to light)
        path.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    } else {
        // Moon icon for light mode (to switch to dark)
        path.setAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
    }
}

