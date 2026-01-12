import React from 'react';
import NavBar from '../components/NavBar.jsx';
import { Link } from 'react-router-dom';
import WeeklyCalendar from '../components/WeeklyCalendar.jsx';
import ApprovalGate from '../components/ApprovalGate.jsx';

function VolunteerPage() {
  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar startCollapsed={true} />

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center items-center gap-8 py-8 px-4">
        <Link to="/volunteer">
          <button className="text-2xl text-white font-bold bg-[#d1abc3] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
            Sign Up
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
            Sign Up
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

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>

      {/* Calendar wrapped with approval check */}
      <ApprovalGate requireApproval={true}>
        <WeeklyCalendar />
      </ApprovalGate>

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
    </div>
  );
}

export default VolunteerPage;