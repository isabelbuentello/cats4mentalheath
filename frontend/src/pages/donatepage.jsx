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
          
       {/* Container for all 3 buttons */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12">
        
        <a 
          href="https://www.amazon.com/hz/wishlist/ls/2I61EMFF773H8?ref_=wl_share"
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#9fc8a7] hover:bg-[#addbc4] text-gray-800 hover:!text-gray-800 font-normal py-12 px-18 rounded-2xl text-2xl text-center transition-all shadow-md min-w-[250px]"
        >
          Amazon Wishlist
        </a>

        <a 
          href="https://venmo.com/u/cats4mentalhealth"
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#9fc8a7] hover:bg-[#addbc4] text-gray-800 hover:!text-gray-800 font-semibold py-6 px-12 rounded-2xl text-2xl text-center transition-all shadow-md min-w-[200px]"
        >
          Venmo
        </a>

        <a 
          href="https://cash.app/$CatsForMentalHealth"
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#9fc8a7] hover:bg-[#addbc4] text-gray-800 hover:!text-gray-800 font-semibold py-6 px-12 rounded-2xl text-2xl text-center transition-all shadow-md min-w-[200px]"
        >
          CashApp
        </a>

      </div>

        </div>
      </div>
    </div>
  )
}
/* <div className="text-gray-700 mb-3">
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
          </div>

*/

export default DonatePage