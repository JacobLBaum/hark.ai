import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PodcastPage from './components/PodcastPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/podcasts/" element={<PodcastPage />} />
      </Routes>
    </Router>
  );
}

export default App;
