import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/homepage'
import JoinPage from './pages/joinpage'
import LoginPage from './pages/login'
import DonatePage from './pages/donatepage'
import VolunteerPage from './pages/volunteer'
import FeedingInstructionsPage from './pages/feedinginstructs' 
import YouPage from './pages/you'
import MapPage from './pages/map' 
import OurCats from './pages/ourcats' 
import AdminPage from './pages/admin'
import EventsPage from './pages/events'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/feeding-instructions" element={<FeedingInstructionsPage />} />
        <Route path="/you-page" element={<YouPage />} />
        <Route path="/map-page" element={<MapPage />} />
        <Route path="/ourcats" element={<OurCats />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App