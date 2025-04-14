import { initializeSpeechRecognition } from './webSpeechExample.js';
class VoiceCommandHandler {
    constructor() {
        this.recognition = null;
        // Initialize speech recognition with callback
        const recognitionInstance = initializeSpeechRecognition((result) => {
            this.handleTranscription(result);
        });
        if (recognitionInstance) {
            this.recognition = recognitionInstance;
        }
        // Also listen for the custom event
        document.addEventListener('transcriptionComplete', (event) => {
            this.handleTranscription(event.detail);
        });
    }
    async handleTranscription(result) {
        try {
            // Process the transcription
            const processedText = this.processTranscription(result.transcript);
            // Send to your API
            await this.sendToAPI(processedText);
            // Update your UI or state
            this.updateApplicationState(processedText);
        }
        catch (error) {
            console.error('Error handling transcription:', error);
        }
    }
    processTranscription(text) {
        // Add any text processing logic here
        return text.trim().toLowerCase();
    }
    async sendToAPI(text) {
        try {
            const response = await fetch('your-api-endpoint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: text })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }
    updateApplicationState(text) {
        // Update your application state or UI based on the transcription
        const event = new CustomEvent('voiceCommandReceived', {
            detail: { command: text }
        });
        document.dispatchEvent(event);
    }
    // Public methods to control recognition
    startListening() {
        if (this.recognition) {
            this.recognition.start();
        }
        else {
            console.error('Speech recognition not initialized');
        }
    }
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}
// Usage in your application
const voiceHandler = new VoiceCommandHandler();
// You can start/stop programmatically
export function startVoiceRecognition() {
    voiceHandler.startListening();
}
export function stopVoiceRecognition() {
    voiceHandler.stopListening();
}
