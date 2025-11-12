import { useState } from 'react'
import NavBar from '../components/NavBar.jsx'
import '../styles/homepage.css'
import CircularGallery from '../components/CircularGallery.jsx'

function Home() {

  return (
    <div className= 'container'>
      <NavBar />
      <h1 className= 'title'> cats for mental health</h1>
      <div className= 'subhead'> we help stray cats at uh!! </div>
      <div className= 'content'>

        <div>
          <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02}/>
          </div>
        </div>
        <div className= 'caption'> just some of our cute campus cats </div>
      </div>
      <div>
        <p className= 'para1'> we feed cats cats cats cats cats cats cats cats cats cats cats cats cats
          cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
          cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
          cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats
        </p>
      </div>
    </div>
  )
}

export default Home
