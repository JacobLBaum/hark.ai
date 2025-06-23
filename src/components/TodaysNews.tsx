import React, { useEffect, useState } from "react";
import "./TodaysNews.css";

function getTodayPath() {
  return new Date().toISOString().split("T")[0];
}

const R2_BASE_URL = "https://hark-ai.com";

const TodaysNews: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const today = getTodayPath();
    const audioUrl = `${R2_BASE_URL}/podcasts/${today}/default/audio.mp3`;
    setAudioUrl(audioUrl);
  }, []);

  return (
    <div className="harkai-main">
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