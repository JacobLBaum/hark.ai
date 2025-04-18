/**
 * Perplexity API service
 * This file provides functionality to interact with Perplexity's Sonar Medium model
 */

// The API key is accessed through Vite's environment variables
// Never expose this key directly in your code
const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || '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';

/**
 * Fetches a daily news podcast script from Perplexity's Sonar Medium model
 * @returns A promise resolving to the generated text
 */
export async function fetchDailyNewsPodcast(): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: "Give me a brief of the daily news and top stories of the day. The text should be in the style and flow of a daily news podcast. It should be readable in 1 minute."
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error details:', errorData);
      throw new Error(`Perplexity API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching news from Perplexity:', error);
    throw error;
  }
}

/**
 * Check if the Perplexity API key is configured
 */
export function isPerplexityConfigured(): boolean {
  return !!perplexityApiKey;
} 
