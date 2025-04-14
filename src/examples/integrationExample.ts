import { initializeSpeechRecognition, TranscriptionResult } from './webSpeechExample.js';

// Declare custom event types
interface TranscriptionCompleteEvent extends CustomEvent<TranscriptionResult> {
    detail: TranscriptionResult;
}

interface VoiceCommandEvent extends CustomEvent<{ command: string }> {
    detail: { command: string };
}

declare global {
    interface DocumentEventMap {
        'transcriptionComplete': TranscriptionCompleteEvent;
        'voiceCommandReceived': VoiceCommandEvent;
    }
}

class VoiceCommandHandler {
    private recognition: ReturnType<typeof initializeSpeechRecognition> | null = null;

    constructor() {
        // Initialize speech recognition with callback
        const recognitionInstance = initializeSpeechRecognition((result: TranscriptionResult) => {
            this.handleTranscription(result);
        });

        if (recognitionInstance) {
            this.recognition = recognitionInstance;
        }

        // Also listen for the custom event
        document.addEventListener('transcriptionComplete', (event: TranscriptionCompleteEvent) => {
            this.handleTranscription(event.detail);
        });
    }

    private async handleTranscription(result: TranscriptionResult) {
        try {
            // Process the transcription
            const processedText = this.processTranscription(result.transcript);

            // Send to your API
            await this.sendToAPI(processedText);

            // Update your UI or state
            this.updateApplicationState(processedText);

        } catch (error) {
            console.error('Error handling transcription:', error);
        }
    }

    private processTranscription(text: string): string {
        // Add any text processing logic here
        return text.trim().toLowerCase();
    }

    private async sendToAPI(text: string) {
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

        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }

    private updateApplicationState(text: string) {
        // Update your application state or UI based on the transcription
        const event = new CustomEvent('voiceCommandReceived', {
            detail: { command: text }
        }) as VoiceCommandEvent;
        document.dispatchEvent(event);
    }

    // Public methods to control recognition
    public startListening() {
        if (this.recognition) {
            this.recognition.start();
        } else {
            console.error('Speech recognition not initialized');
        }
    }

    public stopListening() {
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