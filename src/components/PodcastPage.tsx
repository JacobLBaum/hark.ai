import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./PodcastPage.css";

function getTodayPath() {
  return new Date().toISOString().split("T")[0];
}

function getDatePath(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

const R2_BASE_URL = "https://hark-ai.com";

interface AudioEffect {
  id: number;
  type: 'wave' | 'bit';
  y: number;
  delay: number;
  startTime: number;
}

const PodcastPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([]);
  const [effectId, setEffectId] = useState(0);
  const [podcastTitle, setPodcastTitle] = useState<string>("Today's Podcast");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [foundDate, setFoundDate] = useState<string | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Function to check if an audio file exists
  const checkAudioExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error(`Error checking audio existence: ${error}`);
      return false;
    }
  };

  // Function to find the most recent podcast
  const findMostRecentPodcast = useCallback(async (topic: string, dur: string) => {
    console.log(`Starting search for podcast: topic=${topic}, duration=${dur}`);
    setIsLoading(true);
    setError(null);
    
    // Convert topic from URL format (%s) to R2 path format (underscores)
    const r2Topic = topic.replace(/%s/g, '_');
    console.log(`Converted topic for R2 path: ${r2Topic}`);

    // Check dates from today going back up to 30 days
    for (let daysAgo = 0; daysAgo <= 30; daysAgo++) {
      const datePath = daysAgo === 0 ? getTodayPath() : getDatePath(daysAgo);
      const testUrl = `${R2_BASE_URL}/podcasts/${datePath}/${r2Topic}/${dur}/default/audio.mp3`;
      
      console.log(`Checking URL: ${testUrl}`);
      const exists = await checkAudioExists(testUrl);
      console.log(`URL ${exists ? 'EXISTS' : 'NOT FOUND'}: ${testUrl}`);
      
      if (exists) {
        console.log(`✅ Podcast found! Setting audio URL: ${testUrl}`);
        setAudioUrl(testUrl);
        setFoundDate(datePath);
        setIsLoading(false);
        return;
      }
    }

    // If no podcast found after 30 days, show error
    console.log(`❌ No podcast found after checking 30 days for topic: ${topic}`);
    setError("Sorry, no podcast available yet...");
    setAudioUrl(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const animateParticles = () => {
      setAudioEffects(prev => {
        const now = Date.now();
        return prev.filter(effect => {
          const duration = effect.type === 'wave' ? 2500 : 1500;
          const elapsed = now - effect.startTime;
          const progress = Math.min(elapsed / duration, 2.5);
          // Calculate size based on distance traveled (bell curve)
          const distanceFromCenter = Math.abs(progress - 0.5) * 2;
          const size = Math.max(0.1, 1 - distanceFromCenter * distanceFromCenter);
          // Only remove if at the far right and very small
          return !(progress >= 2.5 && size < 0.2);
        });
      });
      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const topic = searchParams.get('topic') || 'daily';
    const dur = searchParams.get('dur') || '5';
    
    // Set the podcast title based on the topic
    const formattedTitle = topic
      .replace(/%s/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    setPodcastTitle(formattedTitle);

    // Find the most recent podcast
    findMostRecentPodcast(topic, dur);
  }, [searchParams, findMostRecentPodcast]);

  useEffect(() => {
    const createRandomEffect = () => {
      const type = Math.random() > 0.5 ? 'wave' : 'bit';
      const y = Math.random() * window.innerHeight; // Random vertical position
      const delay = 4; // Random delay up to 2 seconds
      
      const newEffect: AudioEffect = {
        id: effectId,
        type,
        y,
        delay,
        startTime: Date.now()
      };
      
      setAudioEffects(prev => [...prev, newEffect]);
      setEffectId(prev => prev + 1);
    };

    // Create effects every 3 seconds
    const interval = setInterval(createRandomEffect, 3000);
    
    // Create initial effect after a short delay
    const initialTimeout = setTimeout(createRandomEffect, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [effectId]);

  const getParticleStyle = (effect: AudioEffect) => {
    const now = Date.now();
    const elapsed = now - effect.startTime;
    const duration = effect.type === 'wave' ? 2500 : 1500;
    const progress = Math.min(elapsed / duration, 1.5);
    
    // Calculate position based on progress
    const x = progress * (window.innerWidth + 50);
    
    // Calculate size based on distance traveled (bell curve)
    const distanceFromCenter = Math.abs(progress - 0.5) * 2; // 0 at center, 1 at edges
    const size = Math.max(0.1, 1 - distanceFromCenter * distanceFromCenter);
    
    // Calculate Y offset for bits
    const yOffset = effect.type === 'bit' ? Math.sin(progress * Math.PI) * -30 : 0;
    
    // Only fade out when very small and near the right edge
    const opacity = (progress > 1.5 && size < 0.2) ? 0 : 1;
    
    return {
      transform: `translateX(${x}px) translateY(${yOffset}px) scale(${size})`,
      opacity: opacity,
      top: `${effect.y}px`,
      animationDelay: `${effect.delay}s`
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="harkai-main">
      {/* Audio wave background effects */}
      {audioEffects.map(effect => (
        effect.type === 'wave' ? (
          <svg
            key={effect.id}
            className="audio-wave-svg"
            width="60" height="60" viewBox="0 0 60 60"
            style={getParticleStyle(effect)}
          >
            <path
              d="M10 30 A 20 20 0 0 1 10 70"
              fill="none"
              stroke="rgba(0,198,255,0.5)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div
            key={effect.id}
            className="audio-bit"
            style={getParticleStyle(effect)}
          />
        )
      ))}
      
      <header className="harkai-banner">
        <h1>Hark-AI</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Home
        </button>
      </header>
      <section className="podcast-highlight">
        <h2 className="podcast-title">{podcastTitle}</h2>
        {foundDate && foundDate !== getTodayPath() && (
          <p className="podcast-date">From {formatDate(foundDate)}</p>
        )}
        <div className="audio-player-wrapper">
          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Searching for podcast...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <h4>No Podcast Found</h4>
              <p>{error}</p>
            </div>
          ) : audioUrl ? (
            <audio controls src={audioUrl} className="harkai-audio-player" />
          ) : (
            <p className="audio-unavailable">Audio not available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PodcastPage; 