import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TopicPage.css";
import { fetchPodcastsForTopic, fetchPresignedUrl, Podcast } from "../services/backend";

interface AudioEffect {
  id: number;
  type: 'wave' | 'bit';
  y: number;
  delay: number;
  startTime: number;
}

const TopicPage: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([]);
  const [effectId, setEffectId] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!topic) {
      setError("Topic not specified");
      setLoading(false);
      return;
    }

    fetchPodcastsForTopic(topic)
      .then(setPodcasts)
      .catch(() => setError("Failed to load podcasts."))
      .finally(() => setLoading(false));
  }, [topic]);

  useEffect(() => {
    const animateParticles = () => {
      setAudioEffects(prev => {
        const now = Date.now();
        return prev.filter(effect => {
          const duration = effect.type === 'wave' ? 2500 : 1500;
          const elapsed = now - effect.startTime;
          const progress = Math.min(elapsed / duration, 2.5);
          const distanceFromCenter = Math.abs(progress - 0.5) * 2;
          const size = Math.max(0.1, 1 - distanceFromCenter * distanceFromCenter);
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
    const createRandomEffect = () => {
      const type = Math.random() > 0.5 ? 'wave' : 'bit';
      const y = Math.random() * window.innerHeight;
      const delay = 4;
      
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

    const interval = setInterval(createRandomEffect, 3000);
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
    
    const x = progress * (window.innerWidth + 50);
    const distanceFromCenter = Math.abs(progress - 0.5) * 2;
    const size = Math.max(0.1, 1 - distanceFromCenter * distanceFromCenter);
    const yOffset = effect.type === 'bit' ? Math.sin(progress * Math.PI) * -30 : 0;
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

  const handlePodcastClick = async (podcast: Podcast) => {
    try {
      const presignedUrl = await fetchPresignedUrl(podcast.id);
      navigate(`/podcasts/?audioUrl=${encodeURIComponent(presignedUrl)}&title=${encodeURIComponent(podcast.title)}`);
    } catch (err) {
      setError(`Failed to load podcast: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatTopicName = (topicName: string) => {
    return topicName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
      
      <section className="topic-content">
        <h2 className="topic-title">{topic ? formatTopicName(topic) : 'Topic'}</h2>
        
        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading podcasts...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && podcasts.length === 0 && (
          <div className="no-podcasts">
            <p>No podcasts available for this topic yet.</p>
          </div>
        )}
        
        {!loading && !error && podcasts.length > 0 && (
          <div className="podcast-list">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="podcast-item"
                onClick={() => handlePodcastClick(podcast)}
              >
                <h3 className="podcast-item-title">{podcast.title}</h3>
                <p className="podcast-item-date">{formatDate(podcast.created_at)}</p>
                {podcast.summary && (
                  <p className="podcast-item-summary">{podcast.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TopicPage;

