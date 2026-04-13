import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const MENU = {
  admin: [
    { section: 'Principal', items: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/ordenes', icon: '📋', label: 'Órdenes' },
    ]},
    { section: 'Gestión', items: [
      { to: '/clientes', icon: '👥', label: 'Clientes' },
      { to: '/tecnicos', icon: '🔧', label: 'Técnicos' },
      { to: '/equipos', icon: '❄️', label: 'Equipos' },
    ]},
    { section: 'Operaciones', items: [
      { to: '/mantenimientos', icon: '🛠️', label: 'Mantenimientos' },
      { to: '/repuestos', icon: '⚙️', label: 'Repuestos' },
      { to: '/cotizaciones', icon: '💰', label: 'Cotizaciones' },
    ]},
  ],
  tecnico: [
    { section: 'Mi Trabajo', items: [
      { to: '/ordenes', icon: '📋', label: 'Mis Órdenes' },
      { to: '/mantenimientos', icon: '🛠️', label: 'Mantenimientos' },
    ]},
  ],
  cliente: [
    { section: 'Mi Cuenta', items: [
      { to: '/ordenes', icon: '📋', label: 'Mis Solicitudes' },
      { to: '/equipos', icon: '❄️', label: 'Mis Equipos' },
      { to: '/cotizaciones', icon: '💰', label: 'Mis Cotizaciones' },
    ]},
  ],
}

const ROLE_LABEL = { admin: 'Administrador', tecnico: 'Técnico', cliente: 'Cliente' }

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const menu = MENU[usuario?.rol] || []

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>❄ ClimaTech</h1>
          <span>Sistema de Gestión</span>
        </div>
        <nav className="sidebar-nav">
          {menu.map(section => (
            <div key={section.section} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{usuario?.nombre?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{usuario?.nombre}</div>
              <div className="user-role">{ROLE_LABEL[usuario?.rol]}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{marginTop:8,color:'var(--red)'}}>
            <span className="icon">🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
