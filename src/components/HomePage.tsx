import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { fetchAvailablePodcastTopics } from "../services/perplexity";

interface AudioEffect {
  id: number;
  type: 'wave' | 'bit';
  y: number;
  delay: number;
  startTime: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([]);
  const [effectId, setEffectId] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const [podcastTopics, setPodcastTopics] = useState<{ topic: string, duration: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailablePodcastTopics()
      .then(setPodcastTopics)
      .catch(() => setError("Failed to load podcast topics."))
      .finally(() => setLoading(false));
  }, []);

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
      </header>
      <section className="homepage-content">
        <h2 className="homepage-title">Welcome to Hark-AI</h2>
        <p className="homepage-subtitle">Choose your podcast experience</p>
        <div className="button-container">
          {loading && <p>Loading topics...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && podcastTopics.map(({ topic, duration }) => {
            // Convert underscores to %s for URL
            const linkTopic = topic.replace(/_/g, '%s');
            return (
              <button
                key={topic}
                className="podcast-button"
                onClick={() => navigate(`/podcasts/?topic=${encodeURIComponent(linkTopic)}&dur=${encodeURIComponent(duration)}`)}
              >
                {topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 