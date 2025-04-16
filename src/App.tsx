import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="container">
      <h1>Audio Player Demo</h1>
      <div className="card">
        <button onClick={handlePlayPause} className="play-button">
          {isPlaying ? 'Pause' : 'Play'} Audio
        </button>
        <audio 
          ref={audioRef} 
          src="/audio/sample.mp3" 
          onEnded={() => setIsPlaying(false)}
        />
        <p className="info">
          {isPlaying ? 'Now playing...' : 'Click Play to start the audio'}
        </p>
      </div>
    </div>
  )
}

export default App
