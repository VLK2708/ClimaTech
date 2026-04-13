import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const EMPTY = { nombre: '', telefono: '', direccion: '', email: '', contrasena: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/clientes').then(r => setClientes(r.data.data || [])).catch(() => toast.error('Error cargando clientes')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (c) => { setForm({ nombre: c.nombre, telefono: c.telefono || '', direccion: c.direccion || '', email: c.usuario?.email || '', contrasena: '' }); setEditing(c); setModal(true) }

  const handleSave = async () => {
    if (!form.nombre.trim()) return toast.error('El nombre es requerido')
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/clientes/${editing.id}`, { nombre: form.nombre, telefono: form.telefono, direccion: form.direccion })
        toast.success('Cliente actualizado')
      } else {
        await api.post('/clientes', form)
        toast.success('Cliente creado')
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await api.delete(`/clientes/${id}`)
      toast.success('Cliente eliminado'); load()
    } catch { toast.error('Error al eliminar') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Clientes</h2><p className="page-subtitle">{clientes.length} registros</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Cliente</button>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card" style={{padding:0}}>
          {clientes.length === 0 ? (
            <div className="empty-state"><div className="icon">👥</div><h3>Sin clientes</h3><p>Agrega tu primer cliente</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id}>
                      <td className="font-mono text-accent">{c.id}</td>
                      <td><strong>{c.nombre}</strong></td>
                      <td>{c.telefono || <span className="text-muted">—</span>}</td>
                      <td className="text-sm">{c.direccion || <span className="text-muted">—</span>}</td>
                      <td className="text-sm">{c.usuario?.email || <span className="text-muted">Sin cuenta</span>}</td>
                      <td><span className={`badge ${c.usuario?.activo ? 'badge-completada' : 'badge-cancelada'}`}>{c.usuario?.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre completo" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="300-123-4567" /></div>
              <div className="form-group"><label className="form-label">Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Calle 45 #23-10" /></div>
              {!editing && <>
                <div className="form-group"><label className="form-label">Email (para acceso)</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="cliente@email.com" /></div>
                <div className="form-group"><label className="form-label">Contraseña</label><input type="password" className="form-control" value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} placeholder="Mínimo 6 caracteres" /></div>
              </>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
