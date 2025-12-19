import NavBar from '../components/NavBar.jsx'
import { Link } from 'react-router-dom';

function FeedingInstructionsPage() {
  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar startCollapsed={true} />

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
      
      {/* Desktop Navigation */}
            <div className="hidden md:flex justify-center items-center gap-8 py-8 px-4">
              <Link to="/volunteer">
                  <button className="text-2xl text-white font-bold bg-[#d1abc3] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                      signup
                  </button>
              </Link>
              <Link to="/map-page">
                  <button className="text-2xl text-white font-bold bg-[#ede0ca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                      map
                  </button>
              </Link>
              <Link to="/ourcats">
                  <button className="text-2xl text-white font-bold bg-[#cadaed] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                      our cats
                  </button>
              </Link>
              <Link to="/feeding-instructions"> 
                <button className="text-2xl text-white font-bold bg-[#d4edca] hover:bg-[#ffb3c1] px-6 py-3 rounded-lg transition-colors">
                  feeding instructions
                </button>
              </Link>
              <Link to="/you-page" className="col-span-2"> 
                <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                  you
                </button>
              </Link>
            </div>
      
            {/* Mobile Navigation */}
                <div className="md:hidden grid grid-cols-2 gap-4 p-4">
                  <Link to="/volunteer">
                    <button className="bg-[#d1abc3] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                      signup
                    </button>
                  </Link>
                  <Link to="/ourcats">
                    <button className="bg-[#cadaed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                      our cats
                    </button>
                  </Link>
                  <Link to="/map-page">
                    <button className="bg-[#ede0ca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                      map
                    </button>
                  </Link>
                  <Link to="/you-page">
                    <button className="bg-[#d5caed] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                      you
                    </button>
                  </Link>
                  <Link to="/feeding-instructions" className="col-span-2">
                    <button className="bg-[#d4edca] hover:bg-[#ffb3c1] p-4 text-white font-bold rounded-lg transition-colors w-full">
                      feeding instructions
                    </button>
                  </Link>
                </div>

        <h1 className='greeting'> how to feed </h1>

        <div className="max-w-6xl mx-auto py-8 space-y-10" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Card 1 - Full Width */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Hi Campus Volunteer!</h2>
        <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Thanks for your interest in volunteering to feed our campus cats!</p>
            <p>
            If you haven't completed your training orientation with an officer, please fill out{' '}
            <a 
                href="https://forms.gle/3TWKgvE5iEQVugFJA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
            >
                this form
            </a>
            , and an officer will reach out shortly.
            </p>
            <p>If you have completed training, here are some quick reminders on how to feed!</p>
        </div>
        </div>

        {/* 2x2 Grid for remaining cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Feeding Locations</h2>
            <p className="text-gray-700 mb-3">We have 3 feeding locations!</p>
            <ul className="list-none space-y-2 text-gray-700">
                <li>Equal Opportunity Building</li>
                <li>Zone D Parking Lot</li>
                <li>Law Center & Loft Area</li>
            </ul> <br/ >
            Feel free to pick just 1, or 2, or even all of them!

            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">How Much?</h2>
            <div className="text-gray-700 space-y-4">
                <div>
                <h3 className="font-semibold text-lg mb-2">AM Shift</h3>
                <ul className="list-none space-y-1">
                    <li>One can of wet food</li>
                    <li>One scoop of dry food</li>
                </ul>
                </div>
                <div>
                <h3 className="font-semibold text-lg mb-2">PM Shift</h3>
                <ul className="list-none space-y-1">
                    <li>One scoop of dry food</li>
                </ul>
                </div>
                <p className="font-medium pt-2">Please change water for every shift & ensure bowls are clean!</p>
            </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Recommended Supplies</h2>
            <ul className="list-none space-y-2 text-gray-700">
                <li>- Ziploc/Plastic bag of dry food</li>
                <li>- Wet food cans</li>
                <li>- Water container</li>
                <li>- Plastic bags for trash</li>
                <li>- Disposable gloves/utensils/napkins (optional)</li>
            </ul>
            <p className="text-gray-700 mt-4 font-medium">All found in our feeding lounge!</p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Reminders</h2>
            <ul className="list-none space-y-3 text-gray-700">
                <li>- If you are the only person feeding a station that day, please provide an extra scoop of dry food.</li>
                <li>- Please remember to sign up in our portal before feeding!</li>
                <li>-Don't forget to send a pic of fed stations to our Discord Volunteering channel for proof of volunteering!</li>
            </ul>
            </div>
        </div>
        </div>
    </div>
    )
    }

export default FeedingInstructionsPage;  

