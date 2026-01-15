import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <img src="/logo.png" alt="International Tax Observatory" className="nav-logo" />
        <span className="nav-brand">Wealth Tax Simulator</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/papers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Papers
        </NavLink>
        <NavLink to="/methodology" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Methodology
        </NavLink>
      </div>
    </nav>
  )
}

export default Navigation