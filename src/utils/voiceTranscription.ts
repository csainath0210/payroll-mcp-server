import OpenAI from 'openai';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from the correct path
config({ path: path.join(process.cwd(), 'src', '.env') });

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes an audio file to text using OpenAI's Whisper model
 * @param audioFilePath - Path to the audio file
 * @returns Promise<string> - The transcribed text
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
    try {
        // Check if file exists
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('Audio file not found');
        }

        // Create a file object from the audio file
        const audioFile = fs.createReadStream(audioFilePath);

        // Transcribe the audio using Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
        });

        return transcription.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

/**
 * Transcribes audio from a buffer using OpenAI's Whisper model
 * @param audioBuffer - Buffer containing the audio data
 * @param filename - Name of the file (required for OpenAI API)
 * @returns Promise<string> - The transcribed text
 */
export async function transcribeAudioBuffer(audioBuffer: Buffer, filename: string): Promise<string> {
    try {
        // Create a temporary file
        const tempFilePath = path.join(process.cwd(), 'temp', filename);
        
        // Ensure temp directory exists
        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write buffer to temporary file
        fs.writeFileSync(tempFilePath, audioBuffer);

        // Transcribe the audio
        const transcription = await transcribeAudio(tempFilePath);

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

        return transcription;
    } catch (error) {
        console.error('Error transcribing audio buffer:', error);
        throw error;
    }
} 