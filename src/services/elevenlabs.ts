/**
 * ElevenLabs API service
 * This file provides functionality to interact with ElevenLabs text-to-speech API
 */

// The API key for ElevenLabs is hardcoded for now, but ideally should be in environment variables
// I'm using the directly provided key since the user gave it to us in the prompt
const elevenLabsApiKey = 'sk_800d0976c507de9ee2ff0c37bdb2cab7cb9fcdbecb4c5b9a';

// Default voice ID - using "Rachel" which is a popular ElevenLabs voice
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

/**
 * Converts text to speech using ElevenLabs API
 * @param text The text to convert to speech
 * @param voiceId The voice ID to use (optional)
 * @returns A promise resolving to an audio blob
 */
export async function textToSpeech(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<Blob> {
  try {
    // For long texts, we need to split it into smaller chunks
    // ElevenLabs has a limit on text size
    const maxChunkSize = 5000; // characters
    let textToProcess = text;
    
    if (text.length > maxChunkSize) {
      // If text is too long, truncate it for now
      // A more sophisticated approach would be to split it into paragraphs
      // and make multiple API calls, then concatenate the audio
      console.warn('Text too long, truncating to 5000 characters.');
      textToProcess = text.substring(0, maxChunkSize);
    }
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: textToProcess,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API request failed with status ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error calling ElevenLabs API:', error);
    throw error;
  }
}

/**
 * Gets available voices from ElevenLabs
 * @returns A promise resolving to a list of available voices
 */
export async function getVoices(): Promise<{ voices: Array<{ voice_id: string; name: string; [key: string]: unknown }> }> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': elevenLabsApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    throw error;
  }
}

/**
 * Check if the ElevenLabs API key is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!elevenLabsApiKey;
} 
