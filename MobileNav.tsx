// ...existing imports
import { FaHome, FaSearch, FaBookOpen, FaUser } from 'react-icons/fa'
import './MobileNav.css'

export default function MobileNav() {
  return (
    <nav className="spotify-mobile-nav">
      <NavLink to="/home" className="nav-item"><FaHome /><span>Home</span></NavLink>
      <NavLink to="/search" className="nav-item"><FaSearch /><span>Search</span></NavLink>
      <NavLink to="/library" className="nav-item"><FaBookOpen /><span>Library</span></NavLink>
      <NavLink to="/profile" className="nav-item"><FaUser /><span>Profile</span></NavLink>
    </nav>
  )
}