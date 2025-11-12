import { Link } from 'react-router-dom'
import '../styles/navbar.css'

function NavBar(){

return (
<nav className= 'navbar'>
        <ul>
        <li><Link to="/">about</Link></li>
        <li className='donate'><Link to="/donate">donate</Link></li>
        <li><Link to="/join">join</Link></li>
        <li><Link to="/login">member login</Link></li>
        </ul>
      </nav>
)
}

export default NavBar;