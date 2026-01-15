import { useState } from 'react'
import NavBar from '../components/NavBar.jsx'
import CircularGallery from '../components/CircularGallery.jsx'
import isabel from '../assets/isabel.png';

function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      {/* Spacer div */}
      <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>
      
      <h1 className="text-white text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
        Cats for Mental Health
      </h1>
      
      <div className="text-white text-center text-sm sm:text-base md:text-lg mt-8 px-4">
        We help stray cats at UH!
      </div>
      
      <div className="mt-12 sm:mt-16 px-4">
        <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative">
          <CircularGallery 
            bend={3} 
            textColor="#ffffff" 
            borderRadius={0.05} 
            scrollEase={0.02}
          />
        </div>
        
        <div className="text-white text-center text-sm sm:text-base mt-8 sm:mt-4">
          just some of our cute campus cats
        </div>
      </div>
      
      {/* About Section */}
      <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '48px', paddingBottom: '80px' }} className="sm:px-8 md:px-16 lg:px-24 sm:py-16 md:py-20">
        <h2 className="text-white text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
          Our Story
        </h2>
        
        <div className="max-w-6xl mx-auto space-y-6 text-[#986e82] text-base sm:text-lg leading-relaxed">
          <p>
            Our story began in 2017 when two brothers, Hamlet and Lear, arrived at the University of Houston after Hurricane Harvey. These young cats quickly captured the hearts of students and faculty who banded together to care for them. Though Hamlet eventually disappeared, Lear remained and became a beloved campus fixture.
          </p>
          
          <p>
            When Lear brought home his partner, Momma, the feeding group officially became UH Campus Cats. Together, Lear and Momma raised their son Napolean, who later found his own mate, Natasha. The campus cat family grew, and so did our community of dedicated volunteers committed to their wellbeing.
          </p>
          
          <p>
            As the university raised concerns about the cats' public presence, we took action by microchipping them and eventually finding them safe homes. This challenge inspired us to evolve. We rebranded as "Cats for Mental Health" and became a registered student organization at UH, focusing on education about TNR (Trap-Neuter-Return) and rescue work.
          </p>
          
          <p>
            In 2023, approximately one year after being adopted, Lear went missing and the club lost contact with his adopter. The heartbreak of losing Lear inspired our community to take action, leading to the foundation of Lear's Legacy Cat Rescue, a non-profit providing TNR and rescue services for Houston-area cats. Today, both the club and the rescue continue the legacy of Lear and Momma, helping stray and feral cats across campus and beyond.
          </p>
        </div>
        
        {/* Officers Section */}
        <div style={{ marginTop: '64px', paddingBottom: '20px' }} className="sm:mt-20">
          <h2 className="text-white text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
            Meet Our Officers
          </h2>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20"></div>
              <h3 className="text-white text-xl font-bold mb-1">Emilie Z</h3>
              <p className="text-[#986e82] text-sm mb-2">President</p>
              <p className="text-white text-sm">Brief bio or fun fact about the officer</p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20"></div>
              <h3 className="text-white text-xl font-bold mb-1">Evelyn T</h3>
              <p className="text-[#986e82] text-sm mb-2">Vice President</p>
              <p className="text-white text-sm">Brief bio or fun fact about the officer</p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20"></div>
              <h3 className="text-white text-xl font-bold mb-1">Ornella M</h3>
              <p className="text-[#986e82] text-sm mb-2">Treasurer</p>
              <p className="text-white text-sm">Brief bio or fun fact about the officer</p>
            </div>

            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20"></div>
              <h3 className="text-white text-xl font-bold mb-1">Rashmika K</h3>
              <p className="text-[#986e82] text-sm mb-2">Event Coordinator</p>
              <p className="text-white text-sm">Brief bio or fun fact about the officer</p>
            </div>

            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20"></div>
              <h3 className="text-white text-xl font-bold mb-1">Laura L</h3>
              <p className="text-[#986e82] text-sm mb-2">Social Media Coordinator</p>
              <p className="text-white text-sm">Brief bio or fun fact about the officer</p>
            </div>

            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 text-center">
              <img 
                src={isabel} 
                alt="Isabel B" 
                className="w-32 h-32 mx-auto mb-4 rounded-full object-cover"
              />
              <h3 className="text-white text-xl font-bold mb-1">Isabel B</h3>
              <p className="text-[#986e82] text-sm mb-2">Webmaster</p>
              <p className="text-white text-sm">My cats' names are Butter & Jupie!</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Home