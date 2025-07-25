import React, { useEffect, useState, useRef } from "react";
import "./TodaysNews.css";

function getTodayPath() {
  return new Date().toISOString().split("T")[0];
}

const R2_BASE_URL = "https://hark-ai.com";

interface AudioEffect {
  id: number;
  type: 'wave' | 'bit';
  y: number;
  delay: number;
  startTime: number;
}

const TodaysNews: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([]);
  const [effectId, setEffectId] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const today = getTodayPath();
    const audioUrl = `${R2_BASE_URL}/podcasts/${today}/default/audio.mp3`;
    setAudioUrl(audioUrl);
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
      <section className="podcast-highlight">
        <h2 className="podcast-title">Today's Podcast</h2>
        <div className="audio-player-wrapper">
          {audioUrl ? (
            <audio controls src={audioUrl} className="harkai-audio-player" />
          ) : (
            <p className="audio-unavailable">Audio not available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default TodaysNews;