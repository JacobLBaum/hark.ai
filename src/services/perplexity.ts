/**
 * Perplexity API service
 * This file provides functionality to interact with Perplexity's Sonar Medium model
 */

// The API key is accessed through Vite's environment variables
// Never expose this key directly in your code
const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || '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';
const today = new Date().toISOString().split('T')[0];
const queryData = {
    model: "sonar", // Using Perplexity's Sonar model
  messages: [
    {
      role: "system",
      content: "You are a podcast script writer. Create an engaging 5-minute podcast script about interesting politics, technology, science and global news and developments from the past 24 hours. The script should be conversational and natural to read. Do not include any special characters or markdown formatting. Do not include any emojis."
    },
    {
      role: "user",
      content: `Please write a 5-minute podcast script about the most interesting headlines and stories in politics, technology, science and global news from the past 24 hours (as of ${today}). Focus on recent developments and breaking news.`
    }
  ],
  temperature: 0.7, // Higher temperature for more creative output
  max_tokens: 2500, // Enough tokens for a 5-minute script
  top_p: 0.9,
  return_related_questions: false,
  return_images: false,
  web_search_options: {
    search_context_size: "high" // Get more comprehensive search results
  },
  stream: false // Get complete response at once
};


/**
 * Fetches a daily news podcast script from Perplexity's Sonar Medium model
 * @returns A promise resolving to the generated text
 */
export async function fetchDailyNewsPodcast(): Promise<string> {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify(queryData)
    });
    // const response = await fetch("https://api.perplexity.ai/chat/completions", {
      // method: "POST",
      // headers: {
        // "Content-Type": "application/json",
        // "Authorization": `Bearer ${perplexityApiKey}`
      // },
      // body: JSON.stringify(queryData)
    // });

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
 * Fetches available podcast topics from the backend
 * @returns A promise resolving to an array of topics
 */
export async function fetchAvailablePodcastTopics(): Promise<{ topic: string, duration: string }[]> {
  const response = await fetch('/api/podcast-topics');
  if (!response.ok) {
    throw new Error('Failed to fetch podcast topics');
  }
  return response.json();
}

/**
 * Check if the Perplexity API key is configured
 */
export function isPerplexityConfigured(): boolean {
  return !!perplexityApiKey;
} 
