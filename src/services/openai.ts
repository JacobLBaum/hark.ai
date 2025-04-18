/**
 * OpenAI API service
 * This file provides functionality to interact with OpenAI's API
 */

// The API key is accessed through Vite's environment variables
// Never expose this key directly in your code
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Function to fetch daily news podcast script from OpenAI
export async function fetchDailyNewsPodcast(): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: "Give me a script to a podcast brief of the daily news that can be read in around 5 min. Do not include any headers but do include summaries and sign posting as would be present in a typical daily news podcast. The response should only include those words that are supposed to be heard by the listener."
          }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error details:', errorData);
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching news from OpenAI:', error);
    throw error;
  }
}

// Check if API key is available
export function isApiKeyConfigured(): boolean {
  return !!apiKey;
} 