import { useState, useEffect, useRef } from 'react';
import { fetchDailyNewsPodcast as fetchPerplexityNews, isPerplexityConfigured } from '../services/perplexity';
import { textToSpeech, isElevenLabsConfigured } from '../services/elevenlabs';
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
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [useFallbackSpeech, setUseFallbackSpeech] = useState<boolean>(false);
  
  const isPerplexityApiConfigured = isPerplexityConfigured();
  const isElevenLabsApiConfigured = isElevenLabsConfigured();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchNews = async (forceRefresh = false) => {
    if (useFallback && !forceRefresh) {
      setNewsScript(FALLBACK_NEWS);
      setLoading(false);
      setError(null);
      return;
    }
    
    if (!isPerplexityApiConfigured) {
      setLoading(false);
      setError('API key is not configured. Please add your Perplexity API key to use this feature.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const script = await fetchPerplexityNews();
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
        errorMessage = 'Error: Perplexity server error. Please try again later.';
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

    // Clean up audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Revoke any object URLs to prevent memory leaks
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // Cancel any speech synthesis
      if (speechSynthesis && speechSynthRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [isPerplexityApiConfigured]);

  const handleReadNews = async () => {
    if (!newsScript) return;
    
    // If already speaking or paused
    if (isSpeaking || isPaused) {
      if (useFallbackSpeech) {
        handleFallbackSpeechToggle();
      } else {
        handleElevenLabsAudioToggle();
      }
    } else {
      // Fresh start - not currently speaking or paused
      if (isElevenLabsApiConfigured) {
        startElevenLabsAudio();
      } else {
        startFallbackSpeech();
      }
    }
  };
  
  const handleElevenLabsAudioToggle = () => {
    if (!audioRef.current) return;
    
    if (isSpeaking) {
      // Pause audio
      audioRef.current.pause();
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      // Resume audio
      audioRef.current.play()
        .then(() => {
          setIsSpeaking(true);
          setIsPaused(false);
        })
        .catch(error => {
          console.error('Error resuming audio:', error);
          setAudioError('Failed to resume audio playback. Please try again.');
        });
    }
  };
  
  const handleFallbackSpeechToggle = () => {
    if (!speechSynthesis) return;
    
    if (isSpeaking) {
      // Pause speech
      speechSynthesis.pause();
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      // Resume speech
      speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };
  
  const startElevenLabsAudio = async () => {
    try {
      setIsGeneratingAudio(true);
      setAudioError(null);
      setUseFallbackSpeech(false);
      
      // If we have an existing audio URL and we're just starting over, use it
      if (audioUrlRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsSpeaking(true);
        setIsPaused(false);
        setIsGeneratingAudio(false);
        return;
      }
      
      // Generate new audio if we don't have one yet
      // Revoke any previous object URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // Get audio blob from ElevenLabs
      const audioBlob = await textToSpeech(newsScript);
      
      // Create URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      // Create or update audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setAudioError('Error playing audio. Please try again.');
        };
      } else {
        audioRef.current.src = audioUrl;
      }
      
      // Play the audio
      await audioRef.current.play();
      setIsSpeaking(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error generating or playing speech:', error);
      setAudioError('Failed to generate or play speech. Please try again.');
      
      // Fall back to browser's speech synthesis
      startFallbackSpeech();
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  // Start using the browser's Web Speech API
  const startFallbackSpeech = () => {
    setUseFallbackSpeech(true);
    if ('speechSynthesis' in window) {
      // Cancel any previous speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(newsScript);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setUseFallbackSpeech(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setUseFallbackSpeech(false);
      };
      
      speechSynthRef.current = utterance;
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    } else {
      alert('Your browser does not support text-to-speech functionality.');
    }
  };

  const useFallbackNews = () => {
    setUseFallback(true);
    setNewsScript(FALLBACK_NEWS);
    setError(null);
  };

  // Determine the button text based on play state
  const getButtonText = () => {
    if (isGeneratingAudio) return 'Generating Audio...';
    if (isSpeaking) return 'Pause';
    if (isPaused) return 'Resume';
    return 'Read Aloud';
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
              className={`read-news-button ${isPaused ? 'paused' : ''}`}
              onClick={handleReadNews}
              disabled={!newsScript || isGeneratingAudio}
            >
              {getButtonText()}
            </button>
            <button 
              className="refresh-button" 
              onClick={() => fetchNews(true)}
              disabled={loading || isGeneratingAudio}
            >
              Refresh News
            </button>
          </div>
          
          {audioError && (
            <div className="audio-error">
              <p>{audioError}</p>
              {useFallbackSpeech && <p className="fallback-notice">Using browser's speech synthesis as fallback</p>}
            </div>
          )}
          
          {(isSpeaking || isPaused) && !audioError && (
            <div className={`audio-status ${isPaused ? 'paused' : ''}`}>
              <div className="audio-wave-animation"></div>
              <p>
                {isPaused ? 'Paused' : 'Playing'} audio via 
                {useFallbackSpeech ? " Browser's Speech Synthesis" : " ElevenLabs TTS"}
              </p>
            </div>
          )}
          
          <div className="news-script">
            {newsScript.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          <div className="news-footer">
            <p className="news-disclaimer">
              {useFallback ? 'Static fallback content' : 'Generated with Perplexity\'s Sonar Medium'}
              {(isSpeaking || isPaused) && ` • Audio by ${useFallbackSpeech ? 'Browser TTS' : 'ElevenLabs'}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysNews; 