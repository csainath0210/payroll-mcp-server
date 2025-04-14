import { transcribeAudio } from '../utils/voiceTranscription.js';
import path from 'path';

async function main() {
    try {
        // Path to the sample audio file
        const audioFilePath = path.join(process.cwd(), 'src', 'voice', 'Sample.m4a');
        
        console.log('Starting transcription...');
        const transcription = await transcribeAudio(audioFilePath);
        console.log('Transcription result:', transcription);
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 