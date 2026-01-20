import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';
import AdminPanel from '../components/AdminPanel.jsx';
import VolunteerHoursTracker from '../components/VolunteerHoursTracker.jsx';

function AdminPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-white font-bold">Loading...</p>
      </div>
    );
  }

  if (!auth.currentUser || !isAdmin) {
    return (
      <div className="min-h-screen">
        <NavBar startCollapsed={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold mb-4">Admin Access Required</h2>
            <p className="text-gray-700 mb-6">
              This page is only accessible to administrators.
            </p>
            <Link to="/you-page">
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Back to Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar startCollapsed={true} />

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center items-center gap-8 py-8 px-4">
            <Link to="/volunteer">
            <button className="text-2xl text-white font-bold bg-[#d1abc3] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                Volunteer
            </button>
            </Link>
            <Link to="/map-page">
            <button className="text-2xl text-white font-bold bg-[#ede0ca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                Map
            </button>
            </Link>
            <Link to="/ourcats">
            <button className="text-2xl text-white font-bold bg-[#cadaed] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                Our Cats
            </button>
            </Link>
            <Link to="/feeding-instructions"> 
            <button className="text-2xl text-white font-bold bg-[#d4edca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                Feeding Instructions
            </button>
            </Link>
            <Link to="/you-page" className="col-span-2"> 
            <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                You
            </button>
            </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden grid grid-cols-2 gap-4 p-4">
            <Link to="/volunteer">
            <button className="bg-[#d1abc3] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                Volunteer
            </button>
            </Link>
            <Link to="/ourcats">
            <button className="bg-[#cadaed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                Our Cats
            </button>
            </Link>
            <Link to="/map-page">
            <button className="bg-[#ede0ca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                Map
            </button>
            </Link>
            <Link to="/you-page">
            <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                You
            </button>
            </Link>
            <Link to="/feeding-instructions" className="col-span-2">
            <button className="bg-[#d4edca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                Feeding Instructions
            </button>
            </Link>
        </div>

      <h1 className='greeting'>Admin Dashboard</h1>

      {/* Main Content */}
      <div style={{ padding: '0 16px' }} className="max-w-7xl mx-auto py-8 space-y-8">
        <AdminPanel />
        <VolunteerHoursTracker />
         <div style={{ padding: '32px', fontFamily: "'Instrument Sans', sans-serif" }} className="bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Officer History Book</h2>
         </div>
      </div>
    </div>
  );
}

export default AdminPage;