// import { useState } from 'react'
// import NavBar from '../components/NavBar.jsx'
// import '../styles/homepage.css'
// import CircularGallery from '../components/CircularGallery.jsx'

// function Home() {

//   return (
//     <div className= 'container'>
//       <NavBar />
//       <h1 className= 'title'> cats for mental health</h1>
//       <div className= 'subhead'> we help stray cats at uh!! </div>
//       <div className= 'content'>

//         <div>
//           <div style={{ height: '600px', position: 'relative' }}>
//             <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02}/>
//           </div>
//         </div>
//         <div className= 'caption'> just some of our cute campus cats </div>
//       </div>
//       <div>
//         <p className= 'para1'> we feed cats cats cats cats cats cats cats cats cats cats cats cats cats
//           cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
//           cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
//           cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Home

import { useState } from 'react'
import NavBar from '../components/NavBar.jsx'
import CircularGallery from '../components/CircularGallery.jsx'

function Home() {
  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar />
      
      {/* Spacer div */}
      <div className="h-14 sm:h-16 md:h-20 lg:h-28"></div>
      
      <h1 className="text-white text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">
        cats for mental health
      </h1>
      
      <div className="text-white text-center text-sm sm:text-base md:text-lg mt-8 px-4">
        we help stray cats at uh!!
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
      
      <div>
        <p className="text-base sm:text-xl md:text-2xl px-4 sm:px-8 md:px-16 py-12 sm:py-16 md:py-20 text-center text-[#986e82]">
          we feed cats cats cats cats cats cats cats cats cats cats cats cats cats
          cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
          cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
          cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
        </p>
      </div>
    </div>
  )
}

export default Home