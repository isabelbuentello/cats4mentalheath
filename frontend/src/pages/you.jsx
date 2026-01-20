import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import VolunteerActivityGraph from '../components/VolunteerActivityGraph.jsx';
import UserProfile from '../components/UserProfile.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import UserHoursBadge from '../components/UserHoursBadge.jsx';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';

function YouPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin || false);
        }
      }
    };
    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen ">
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
        <Link to="/you-page">
          <button className="text-2xl text-white font-bold bg-[#d5caed] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            You
          </button>
        </Link>
        {isAdmin && (
          <Link to="/admin">
            <button className="text-2xl text-white font-bold bg-[#b8a0d4] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
              Admin
            </button>
          </Link>
        )}
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
        {isAdmin ? (
          <>
            <Link to="/feeding-instructions">
              <button className="bg-[#d4edca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                feeding instructions
              </button>
            </Link>
            <Link to="/admin">
              <button className="bg-[#b8a0d4] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                Admin
              </button>
            </Link>
          </>
        ) : (
          <Link to="/feeding-instructions" className="col-span-2">
            <button className="bg-[#d4edca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
              Feeding Instructions
            </button>
          </Link>
        )}
      </div>

      <h1 className='greeting'>Your Profile</h1>

      {/* Main Content */}
      <div style={{ padding: '0 16px' }} className="max-w-7xl mx-auto py-8">
        {/* Desktop Layout - 3 columns */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Graph (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            <VolunteerActivityGraph />
            <Leaderboard />
          </div>

          {/* Right Column - User Profile */}
          <div className="lg:col-span-1 space-y-8">
            <UserProfile />
            <UserHoursBadge />
          </div>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          <UserProfile />
          <UserHoursBadge />
          <VolunteerActivityGraph />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

export default YouPage;