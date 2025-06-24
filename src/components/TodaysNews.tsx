import React, { useEffect, useState } from "react";
import "./TodaysNews.css";

function getTodayPath() {
  return new Date().toISOString().split("T")[0];
}

const R2_BASE_URL = "https://hark-ai.com";

interface AudioEffect {
  id: number;
  type: 'wave' | 'bit';
  x: number;
  y: number;
  delay: number;
}

const TodaysNews: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([]);
  const [effectId, setEffectId] = useState(0);

  useEffect(() => {
    const today = getTodayPath();
    const audioUrl = `${R2_BASE_URL}/podcasts/${today}/default/audio.mp3`;
    setAudioUrl(audioUrl);
  }, []);

  useEffect(() => {
    const createRandomEffect = () => {
      const type = Math.random() > 0.5 ? 'wave' : 'bit';
      const y = Math.random() * window.innerHeight; // Random vertical position
      const delay = Math.random() * 2; // Random delay up to 2 seconds
      
      const newEffect: AudioEffect = {
        id: effectId,
        type,
        x: 0, // Start from the very left edge
        y,
        delay
      };
      
      setAudioEffects(prev => [...prev, newEffect]);
      setEffectId(prev => prev + 1);
      
      // Remove the effect after animation completes
      setTimeout(() => {
        setAudioEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 4000);
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

  return (
    <div className="harkai-main">
      {/* Audio wave background effects */}
      {audioEffects.map(effect => (
        <div
          key={effect.id}
          className={effect.type === 'wave' ? 'audio-wave' : 'audio-bit'}
          style={{
            top: `${effect.y}px`,
            animationDelay: `${effect.delay}s`
          }}
        />
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