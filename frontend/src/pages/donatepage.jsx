import NavBar from '../components/NavBar.jsx'
import amazon from '../assets/amazon.png'
import cashapp from '../assets/cashapp.png'
import venmo from '../assets/venmo.png'
import catpic from '../assets/donatecat.png'


function DonatePage() {
  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Spacer div */}
      <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>

      <div className="flex flex-col items-center px-4 py-8 sm:py-12">
        <h1 className="text-white text-center text-4xl sm:text-5xl md:text-6xl mb-8 sm:mb-12">
          Support Our Cats
        </h1>
        
        {/* Two-column layout on desktop, single column on mobile */}
        <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          
          {/* Left column - Text and buttons */}
          <div className="w-full lg:w-1/2 rounded-3xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-white text-center text-lg sm:text-xl lg:text-left mb-8">
              Your donations help us feed and care for the stray cats on our campus. 
              Every contribution makes a difference! 
            </h2>
            
            {/* Container for all 3 buttons - stacked vertically on all screens */}
            <div className="flex flex-col justify-center items-center gap-4">
              
              <a 
                href="https://www.amazon.com/hz/wishlist/ls/2I61EMFF773H8?ref_=wl_share"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:bg-gray-100 py-3 px-6 rounded-2xl transition-all w-48"
              >
                <img 
                  src={amazon} 
                  alt="Amazon Wishlist" 
                  className="w-full h-auto"
                />
              </a>

              <a 
                href="https://venmo.com/u/cats4mentalhealth"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:bg-gray-100 py-3 px-6 rounded-2xl transition-all w-48"
              >
                <img 
                  src={venmo} 
                  alt="Venmo" 
                  className="w-full h-auto"
                />
              </a>

              <a 
                href="https://cash.app/$uhc4mh"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center hover:bg-gray-100 py-3 px-6 rounded-2xl transition-all w-48"
              >
                <img 
                  src={cashapp} 
                  alt="CashApp" 
                  className="w-full h-auto"
                />
              </a>
            </div>
          </div>

          {/* Right column - Cat image */}
          <div className="w-64 sm:w-72 lg:w-1/2 flex items-center justify-center lg:justify-end">
            <img 
              src={catpic} 
              alt="Donate cat" 
              className="w-full max-w-md h-auto rounded-3xl shadow-lg object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonatePage