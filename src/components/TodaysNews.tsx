import React, { useEffect, useState } from "react";
import "./TodaysNews.css";

function getTodayPath() {
  return new Date().toISOString().split("T")[0];
}

const R2_BASE_URL = "https://hark-ai.com";

const TodaysNews: React.FC = () => {
  const [script, setScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = getTodayPath();
    const scriptUrl = `${R2_BASE_URL}/podcasts/${today}/default/script.txt`;
    const audioUrl = `${R2_BASE_URL}/podcasts/${today}/default/audio.mp3`;

    setAudioUrl(audioUrl);
    setError(null);

    fetch(scriptUrl)
      .then(async res => {
        if (!res.ok) {
          const errorInfo = `Failed to fetch script. Status: ${res.status} ${res.statusText}.`;
          throw new Error(errorInfo);
        }
        return res.text();
      })
      .then(setScript)
      .catch((err: Error) => {
        console.error(err);
        if (err.message.includes('Failed to fetch')) {
          setError("A network or CORS error occurred. Please check your R2 bucket's CORS policy, ensure the file exists for today, and check your network connection.");
        } else {
          setError(err.message);
        }
        setScript(null);
      });
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
        <div className="script-section">
          <h3 className="script-title">Podcast Script</h3>
          {error ? (
            <div className="error-message">
              <h4>Error Loading Script</h4>
              <p>{error}</p>
            </div>
          ) : script ? (
            <pre className="script-text">{script}</pre>
          ) : (
            <p className="script-unavailable">Loading script...</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default TodaysNews; 