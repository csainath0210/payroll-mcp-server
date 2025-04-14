/**
 * This is a TypeScript implementation of the Web Speech API
 * To use this in a web application, you would need to:
 * 1. Create an HTML file with the necessary UI elements
 * 2. Include this JavaScript/TypeScript code
 * 3. Run it in a modern browser that supports the Web Speech API
 */
// Initialize speech recognition with callback
function initializeSpeechRecognition(onTranscriptionComplete) {
    console.log('Initializing speech recognition...');
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Speech recognition not supported in this browser');
        document.body.innerHTML = '<p>Speech recognition not supported in this browser. Please use Chrome.</p>';
        return;
    }
    console.log('Speech recognition is supported');
    // Get UI elements
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resultDiv = document.getElementById('result');
    if (!startButton || !stopButton || !resultDiv) {
        console.error('Required UI elements not found');
        return;
    }
    console.log('Found all UI elements');
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Configure recognition settings
    recognition.continuous = false; // Only listen for one utterance
    recognition.interimResults = false; // Only get final results
    recognition.lang = 'en-IN'; // Set language to Indian English
    console.log('Speech recognition instance created and configured');
    // Handle recognition results
    recognition.onresult = (event) => {
        console.log('Got speech recognition result:', event);
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        // Create result object
        const transcriptionResult = {
            transcript: transcript,
            timestamp: Date.now()
        };
        // Update UI
        resultDiv.innerHTML += `<p><strong>${transcript}</strong></p>`;
        // Call the callback if provided
        if (onTranscriptionComplete) {
            onTranscriptionComplete(transcriptionResult);
        }
        // Dispatch custom event
        const customEvent = new CustomEvent('transcriptionComplete', {
            detail: transcriptionResult
        });
        document.dispatchEvent(customEvent);
    };
    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        resultDiv.innerHTML += `<p class="error">Error: ${event.error}</p>`;
        startButton.disabled = false;
        stopButton.disabled = true;
    };
    // Handle recognition end
    recognition.onend = () => {
        console.log('Speech recognition ended');
        startButton.disabled = false;
        stopButton.disabled = true;
        const status = document.getElementById('status');
        if (status) {
            status.textContent = 'Ready to record again';
            status.style.backgroundColor = '#e8f5e9';
        }
    };
    // Start recording
    startButton.onclick = () => {
        console.log('Start button clicked, starting recognition...');
        try {
            recognition.start();
            startButton.disabled = true;
            stopButton.disabled = false;
            resultDiv.innerHTML += '<p>Listening...</p>';
            const status = document.getElementById('status');
            if (status) {
                status.textContent = 'Listening... Speak now';
                status.style.backgroundColor = '#fff3e0';
            }
        }
        catch (error) {
            console.error('Error starting recognition:', error);
        }
    };
    // Stop recording
    stopButton.onclick = () => {
        console.log('Stop button clicked, stopping recognition...');
        recognition.stop();
    };
    console.log('Speech recognition initialization complete');
    return {
        start: () => recognition.start(),
        stop: () => recognition.stop()
    };
}
// Initialize when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeSpeechRecognition());
}
else {
    initializeSpeechRecognition();
}
export { initializeSpeechRecognition };
