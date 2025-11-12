import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/homepage'
import JoinPage from './pages/joinpage'
import LoginPage from './pages/login'
import DonatePage from './pages/donatepage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App