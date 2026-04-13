import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const EMPTY = { nombre: '', especialidad: '', telefono: '', email: '', contrasena: '' }

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/tecnicos').then(r => setTecnicos(r.data.data || [])).catch(() => toast.error('Error')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (t) => { setForm({ nombre: t.nombre, especialidad: t.especialidad || '', telefono: t.telefono || '', email: '', contrasena: '' }); setEditing(t); setModal(true) }

  const handleSave = async () => {
    if (!form.nombre.trim()) return toast.error('Nombre requerido')
    setSaving(true)
    try {
      if (editing) { await api.put(`/tecnicos/${editing.id}`, { nombre: form.nombre, especialidad: form.especialidad, telefono: form.telefono }); toast.success('Técnico actualizado') }
      else { await api.post('/tecnicos', form); toast.success('Técnico creado') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar técnico?')) return
    try { await api.delete(`/tecnicos/${id}`); toast.success('Eliminado'); load() } catch { toast.error('Error') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Técnicos</h2><p className="page-subtitle">{tecnicos.length} registros</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Técnico</button>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card" style={{padding:0}}>
          {tecnicos.length === 0 ? <div className="empty-state"><div className="icon">🔧</div><h3>Sin técnicos</h3></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Nombre</th><th>Especialidad</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
                <tbody>
                  {tecnicos.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-accent">{t.id}</td>
                      <td><strong>{t.nombre}</strong></td>
                      <td>{t.especialidad || <span className="text-muted">—</span>}</td>
                      <td>{t.telefono || <span className="text-muted">—</span>}</td>
                      <td className="text-sm">{t.usuario?.email || <span className="text-muted">Sin cuenta</span>}</td>
                      <td><div style={{display:'flex',gap:6}}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑️</button>
                      </div></td>
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
              <span className="modal-title">{editing ? 'Editar Técnico' : 'Nuevo Técnico'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Especialidad</label><input className="form-control" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} placeholder="Aires acondicionados split" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
              {!editing && <>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Contraseña</label><input type="password" className="form-control" value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} /></div>
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
