import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PodcastPage from './components/PodcastPage';
import TopicPage from './components/TopicPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics/:topic" element={<TopicPage />} />
        <Route path="/podcasts/" element={<PodcastPage />} />
      </Routes>
    </Router>
  );
}

export default App;
