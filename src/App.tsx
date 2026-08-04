import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { PracticePage } from './pages/PracticePage';
import { DictionaryPage } from './pages/DictionaryPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#ffffff', color: '#111827' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/:word" element={<PracticePage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
