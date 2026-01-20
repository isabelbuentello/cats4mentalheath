import { Link } from 'react-router-dom'
import { useState } from 'react'

function NavBar({ startCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(!startCollapsed);

  return (
    <nav className="w-full py-6 px-8">
      {/* Menu button - visible on all screens when startCollapsed is true */}
      <div className={`flex justify-end ${startCollapsed ? '' : 'md:hidden'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className=" text-white text-3xl focus:outline-none hover:bg-[#f7dcf7] px-4 py-2 rounded-lg transition-colors"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Desktop menu - only shown when NOT startCollapsed */}
      {!startCollapsed && (
        <ul className="hidden md:flex justify-end items-center list-none m-0 p-0 gap-8 pr-8">
          <li>
            <Link 
              to="/" 
              className="block text-white text-center text-2xl font-medium px-6 py-3 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/donate" 
              className="block text-white text-center text-2xl font-medium px-6 py-3 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Donate
            </Link>
          </li>
          <li>
            <Link 
              to="/join" 
              className="block text-white text-center text-2xl font-medium px-6 py-3 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Join
            </Link>
          </li>
          <li>
            <Link 
              to="/login" 
              className="block text-white text-center text-2xl font-medium px-6 py-3 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Login
            </Link>
          </li>
          <li>
            <Link 
              to="/events" 
              className="block text-white text-center text-2xl font-medium px-6 py-3 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Events
            </Link>
          </li>
        </ul>
      )}

      {/* Collapsible menu - shown when isOpen is true */}
      {isOpen && (
        <ul className={`flex flex-col items-end list-none m-0 p-0 mt-4 space-y-2 ${startCollapsed ? '' : 'md:hidden'}`}>
          <li className="w-full">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block text-white text-right text-2xl font-medium px-6 py-4 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              About
            </Link>
          </li>
          <li className="w-full">
            <Link 
              to="/donate" 
              onClick={() => setIsOpen(false)}
              className="block text-white text-right text-2xl font-medium px-6 py-4 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Donate
            </Link>
          </li>
          <li className="w-full">
            <Link 
              to="/join" 
              onClick={() => setIsOpen(false)}
              className="block text-white text-right text-2xl font-medium px-6 py-4 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Join
            </Link>
          </li>
          <li className="w-full">
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)}
              className="block text-white text-right text-2xl font-medium px-6 py-4 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Login
            </Link>
          </li>
          <li className="w-full">
            <Link 
              to="/events" 
              onClick={() => setIsOpen(false)}
              className="block text-white text-right text-2xl font-medium px-6 py-4 no-underline hover:bg-[#e7c0e0] rounded-lg transition-colors"
            >
              Events
            </Link>
          </li>
        </ul>
      )}
    </nav>
  )
}

export default NavBar;