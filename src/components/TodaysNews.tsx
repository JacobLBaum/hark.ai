import { useState, useEffect, useRef } from 'react';
import { fetchDailyNewsPodcast, isApiKeyConfigured } from '../services/openai';
import './TodaysNews.css';

// Fallback news content in case the API fails repeatedly
const FALLBACK_NEWS = `Welcome to today's news brief. Here's what you need to know for today.

In global headlines, ongoing diplomatic efforts continue to address international conflicts, with world leaders calling for peaceful resolutions through dialogue and cooperation.

On the economic front, markets showed mixed reactions to recent policy announcements, with analysts suggesting a cautious outlook for investors in the coming weeks.

In technology news, several major companies have announced innovations aimed at addressing climate change, signaling a growing industry commitment to sustainability.

Health experts continue to emphasize the importance of preventive measures and regular check-ups as we enter the fall season, with a reminder to stay updated on seasonal vaccine recommendations.

In sports, excitement builds for upcoming championship events, with teams making final preparations for what promises to be a competitive season.

That's all for today's brief update. We'll be back tomorrow with more developments from around the world.`;

const TodaysNews: React.FC = () => {
  const [newsScript, setNewsScript] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const isConfigured = isApiKeyConfigured();
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchNews = async (forceRefresh = false) => {
    if (useFallback && !forceRefresh) {
      setNewsScript(FALLBACK_NEWS);
      setLoading(false);
      setError(null);
      return;
    }
    
    if (!isConfigured) {
      setLoading(false);
      setError('API key is not configured. Please add your OpenAI API key to use this feature.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const script = await fetchDailyNewsPodcast();
      setNewsScript(script);
      setFailedAttempts(0);
      setUseFallback(false);
    } catch (err: any) {
      console.error('Error in component:', err);
      let errorMessage = 'Failed to fetch today\'s news. Please try again later.';
      
      // Try to extract more specific error messages
      if (err.message && err.message.includes('404')) {
        errorMessage = 'Error: The specified model was not found. The API may have changed.';
      } else if (err.message && err.message.includes('401')) {
        errorMessage = 'Error: Authentication failed. Please check your API key.';
      } else if (err.message && err.message.includes('429')) {
        errorMessage = 'Error: Rate limit exceeded. Please try again later.';
      } else if (err.message && err.message.includes('500')) {
        errorMessage = 'Error: OpenAI server error. Please try again later.';
      }
      
      // Increment failed attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      // After 3 failed attempts, offer fallback mode
      if (newFailedAttempts >= 3) {
        errorMessage += ' Would you like to use a fallback static news brief instead?';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Clean up speech synthesis when component unmounts
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [isConfigured]);

  const handleReadNews = () => {
    if (!newsScript) return;
    
    if (isSpeaking) {
      // Stop reading
      if (speechSynthesis) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else {
      // Start reading
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(newsScript);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        speechSynthRef.current = utterance;
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      } else {
        alert('Your browser does not support text-to-speech functionality.');
      }
    }
  };

  const useFallbackNews = () => {
    setUseFallback(true);
    setNewsScript(FALLBACK_NEWS);
    setError(null);
  };

  return (
    <div className="todays-news">
      <h2>Today's News</h2>
      
      {loading && (
        <div className="loading">
          <p>Fetching today's news podcast script...</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="refresh-button" 
              onClick={() => fetchNews(true)}
              disabled={loading}
            >
              Try Again
            </button>
            
            {failedAttempts >= 3 && (
              <button 
                className="fallback-button" 
                onClick={useFallbackNews}
              >
                Use Fallback Content
              </button>
            )}
          </div>
        </div>
      )}
      
      {!loading && !error && newsScript && (
        <div className="news-content">
          <div className="news-actions">
            <button 
              className="read-news-button" 
              onClick={handleReadNews}
              disabled={!newsScript}
            >
              {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            </button>
            <button 
              className="refresh-button" 
              onClick={() => fetchNews(true)}
              disabled={loading}
            >
              Refresh News
            </button>
          </div>
          
          <div className="news-script">
            {newsScript.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          <div className="news-footer">
            <p className="news-disclaimer">
              {useFallback ? 'Static fallback content' : 'Generated with OpenAI\'s GPT-3.5'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysNews; 