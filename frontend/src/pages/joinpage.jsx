import NavBar from '../components/NavBar.jsx'
import '../styles/join.css'
import ig from '../assets/ig.png'
import ds from '../assets/ds.png'

function joinpage() {
  return (
    <div>
        <NavBar />
        <h1 className= 'greeting'> We'd Love to Have You! </h1>
        <div className= 'img-container'> 
            <a href="https://www.instagram.com/cats4mentalhealth/" target="_blank" rel="noopener noreferrer">
                <img className= 'ig' src= {ig} alt="instagram"/> 
            </a>
            <a href="https://discord.com/invite/WSJ9cHDs26" target="_blank" rel="noopener noreferrer">
                <img className= 'ds' src= {ds} alt="discord" />
            </a>
        </div>
        <p className= 'volun'> Interested in feeding our campus' cats? <br /> 
        Sign up in our member login, and sign up for a training! </p>
    </div>
  )
}

export default joinpage  
