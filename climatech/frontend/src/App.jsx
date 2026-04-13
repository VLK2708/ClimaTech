import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientesPage from './pages/ClientesPage'
import TecnicosPage from './pages/TecnicosPage'
import EquiposPage from './pages/EquiposPage'
import OrdenesPage from './pages/OrdenesPage'
import MantenimientosPage from './pages/MantenimientosPage'
import RepuestosPage from './pages/RepuestosPage'
import CotizacionesPage from './pages/CotizacionesPage'

const ProtectedRoute = ({ children, roles }) => {
  const { usuario, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => {
  const { usuario } = useAuth()
  if (!usuario) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute roles={['admin']}><ClientesPage /></ProtectedRoute>} />
        <Route path="/tecnicos" element={<ProtectedRoute roles={['admin']}><TecnicosPage /></ProtectedRoute>} />
        <Route path="/equipos" element={<ProtectedRoute roles={['admin', 'cliente']}><EquiposPage /></ProtectedRoute>} />
        <Route path="/ordenes" element={<ProtectedRoute roles={['admin', 'tecnico', 'cliente']}><OrdenesPage /></ProtectedRoute>} />
        <Route path="/mantenimientos" element={<ProtectedRoute roles={['admin', 'tecnico']}><MantenimientosPage /></ProtectedRoute>} />
        <Route path="/repuestos" element={<ProtectedRoute roles={['admin']}><RepuestosPage /></ProtectedRoute>} />
        <Route path="/cotizaciones" element={<ProtectedRoute roles={['admin', 'cliente']}><CotizacionesPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/ordenes" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a2240', color: '#e8edf8', border: '1px solid #2a3a5c' }
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
