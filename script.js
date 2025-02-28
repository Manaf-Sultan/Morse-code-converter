// Morse Code Mapping
const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
};

// Reverse Morse Code Mapping
const reverseMorseCodeMap = Object.entries(morseCodeMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

let isPlaying = false; // Track play/pause state
let currentSymbolIndex = 0; // Track current symbol being played
let timeoutId = null; // Store the timeout ID for pausing

// Convert Text to Morse Code
function textToMorse(text) {
    return text.toUpperCase()
        .split('') // Split into individual characters
        .map(char => morseCodeMap[char] || '') // Map each character to its Morse code
        .join(' '); // Join with spaces for readability
}

// Convert Morse Code to Text
function morseToText(morseCode) {
    return morseCode.split(' ') // Split by spaces
        .map(symbol => reverseMorseCodeMap[symbol] || '') // Map each symbol to its character
        .join(''); // Join without spaces
}

// Play Morse Code Audio
function playMorseCode(morseCode) {
    const dotDuration = 200; // Duration of a dot in milliseconds
    const dashDuration = 600; // Duration of a dash in milliseconds
    const pauseBetweenSymbols = 300; // Pause between symbols in milliseconds
    const pauseBetweenWords = 700; // Longer pause between words

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playNextSymbol() {
        if (!isPlaying || currentSymbolIndex >= morseCode.length) {
            return; // Stop playing if paused or finished
        }

        const symbol = morseCode[currentSymbolIndex];
        const duration = symbol === '.' ? dotDuration : symbol === '-' ? dashDuration : 0;

        if (symbol === '.' || symbol === '-') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Frequency in Hz
            gainNode.gain.value = 0.5; // Volume (0 to 1)

            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration / 1000);
        }

        currentSymbolIndex++;

        // Calculate time until next symbol
        let nextDelay = 0;
        if (symbol === ' ') {
            nextDelay = pauseBetweenWords;
        } else if (morseCode[currentSymbolIndex] && morseCode[currentSymbolIndex] !== ' ') {
            nextDelay = pauseBetweenSymbols;
        }

        // Schedule the next symbol
        timeoutId = setTimeout(playNextSymbol, duration + nextDelay);
    }

    currentSymbolIndex = 0; // Reset index
    playNextSymbol(); // Start playback
}

// Toggle Play/Pause
document.getElementById('play-pause-btn').addEventListener('click', () => {
    const outputText = document.getElementById('output-text').textContent.trim();
    if (!outputText) {
        alert('No Morse code to play!');
        return;
    }

    if (isPlaying) {
        clearTimeout(timeoutId);
        isPlaying = false;
        document.getElementById('play-pause-btn').textContent = 'Play Morse Code';
    } else {
        isPlaying = true;
        document.getElementById('play-pause-btn').textContent = 'Pause Morse Code';
        playMorseCode(outputText);
    }
});

// Convert Button
document.getElementById('convert-btn').addEventListener('click', () => {
    const inputText = document.getElementById('input-text').value.trim();
    if (!inputText) {
        alert('Please enter some text or Morse code!');
        return;
    }

    const hasSpaces = inputText.includes(' ');
    const hasSpecialChars = /[^\w\s.-]/.test(inputText);

    if (hasSpaces && !hasSpecialChars) {
        // Assume input is Morse code
        const englishText = morseToText(inputText);
        document.getElementById('output-text').textContent = englishText;
    } else {
        // Assume input is text
        const morseCode = textToMorse(inputText);
        document.getElementById('output-text').textContent = morseCode;
    }
});

// Copy Button
document.getElementById('copy-btn').addEventListener('click', () => {
    const outputText = document.getElementById('output-text').textContent;
    if (outputText) {
        navigator.clipboard.writeText(outputText).then(() => {
            alert('Output copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        alert('No output to copy!');
    }
});

// Dark Theme Toggle
document.getElementById('theme-toggle').addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
});
