import NavBar from '../components/NavBar.jsx'

function DonatePage() {
  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar />

      {/* Spacer div */}
      <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>

      <div className="flex flex-col items-center px-4 py-8 sm:py-12">
        <h1 className="text-white text-center text-4xl sm:text-5xl md:text-6xl mb-8 sm:mb-12">
          Support Our Cats
        </h1>

        <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>
        
        <div className="max-w-3xl w-full bg-white/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12">
          <p className="text-white text-center text-base sm:text-lg md:text-xl mb-8">
            Your donations help us feed and care for the stray cats on our campus. 
            Every contribution makes a difference! 
          </p>
          
          {/* Add your donation button or form here */}
          <div className="flex justify-center">
            <button className="bg-[#9fc8a7] hover:bg-[#addbc4] text-gray-800 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonatePage