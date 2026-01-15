import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import NavBar from '../components/NavBar.jsx';
import Calendar from '../components/Calendar.jsx';
import '../styles/join.css';

function EventsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin || false);
        }
      }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dfbfdf] flex items-center justify-center">
        <p className="text-2xl text-white font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar />
      <h1 className='greeting'>Upcoming Events</h1>
      
      <p className='volun'>
        Join CFMH for our upcoming events, both on and off campus. <br /> 
        Follow us on Instagram for all the latest event details and updates!
      </p>

      <Calendar isAdmin={isAdmin} />
    </div>
  );
}

export default EventsPage;
