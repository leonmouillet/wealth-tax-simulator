import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Papers from './pages/Papers'
import Methodology from './pages/Methodology'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navigation />
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/methodology" element={<Methodology />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App