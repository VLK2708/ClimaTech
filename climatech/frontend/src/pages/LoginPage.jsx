import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const DEMOS = [
  { label: 'Admin', email: 'admin@climatech.com', pass: 'password123', rol: 'admin' },
  { label: 'Técnico', email: 'tecnico@climatech.com', pass: 'password123', rol: 'tecnico' },
  { label: 'Cliente', email: 'cliente@climatech.com', pass: 'password123', rol: 'cliente' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', contrasena: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      if (data.ok) {
        login(data.token, data.usuario)
        toast.success(`Bienvenido, ${data.usuario.nombre}`)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demo) => {
    setForm({ email: demo.email, contrasena: demo.pass })
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>❄ ClimaTech</h1>
          <p>Sistema de Gestión de Climatización</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={e => setForm({...form, contrasena: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Ingresando...</> : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="demo-users">
          <p>Usuarios de prueba</p>
          {DEMOS.map(d => (
            <div key={d.rol} className="demo-user">
              <span>
                <span className={`badge badge-${d.rol}`}>{d.label}</span>
                &nbsp; {d.email}
              </span>
              <button className="btn btn-outline btn-sm" onClick={() => fillDemo(d)}>Usar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
