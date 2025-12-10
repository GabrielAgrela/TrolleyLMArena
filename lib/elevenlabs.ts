
import { ElevenLabsClient } from "elevenlabs";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
    console.error("❌ ELEVENLABS_API_KEY is missing from environment variables!");
}

const client = new ElevenLabsClient({
    apiKey: apiKey
});

export async function getVoices() {
    try {
        const voices = await client.voices.getAll();
        return voices.voices.map(v => ({
            id: v.voice_id,
            name: v.name,
            previewUrl: v.preview_url
        }));
    } catch (error) {
        console.error("Error fetching voices:", error);
        return [];
    }
}

export async function generateTTS(text: string, voiceId: string): Promise<string | null> {
    try {
        const audio = await client.generate({
            voice: voiceId,
            text,
            model_id: "eleven_flash_v2_5",
            voice_settings: {
                stability: 0.3,
                similarity_boost: 0.9,
                speed: 1.2,
            }
        });

        const fileName = `${uuidv4()}.mp3`;
        const publicDir = path.join(process.cwd(), 'public', 'audio');

        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const filePath = path.join(publicDir, fileName);
        const fileStream = fs.createWriteStream(filePath);

        // Handle the Stream (Node or Web)
        for await (const chunk of audio) {
            fileStream.write(chunk);
        }
        fileStream.end();

        return new Promise((resolve, reject) => {
            fileStream.on('finish', () => resolve(`/audio/${fileName}`));
            fileStream.on('error', reject);
        });

    } catch (error) {
        console.error("Error generating TTS:", error);
        return null;
    }
}
