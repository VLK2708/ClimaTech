import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const EMPTY = { nombre: '', descripcion: '', costo: '', stock: '' }

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/repuestos').then(r => setRepuestos(r.data.data || [])).catch(() => toast.error('Error')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (r) => { setForm({ nombre: r.nombre, descripcion: r.descripcion || '', costo: r.costo, stock: r.stock }); setEditing(r); setModal(true) }

  const handleSave = async () => {
    if (!form.nombre.trim()) return toast.error('Nombre requerido')
    setSaving(true)
    try {
      if (editing) { await api.put(`/repuestos/${editing.id}`, form); toast.success('Repuesto actualizado') }
      else { await api.post('/repuestos', form); toast.success('Repuesto creado') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar repuesto?')) return
    try { await api.delete(`/repuestos/${id}`); toast.success('Eliminado'); load() } catch { toast.error('Error') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Repuestos</h2><p className="page-subtitle">{repuestos.length} registros</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Repuesto</button>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card" style={{padding:0}}>
          {repuestos.length === 0 ? <div className="empty-state"><div className="icon">⚙️</div><h3>Sin repuestos</h3></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Costo</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>
                  {repuestos.map(r => (
                    <tr key={r.id}>
                      <td className="font-mono text-accent">{r.id}</td>
                      <td><strong>{r.nombre}</strong></td>
                      <td className="text-sm text-muted">{r.descripcion || '—'}</td>
                      <td className="font-mono">${Number(r.costo).toLocaleString()}</td>
                      <td><span className={`badge ${r.stock > 10 ? 'badge-completada' : r.stock > 0 ? 'badge-pendiente' : 'badge-cancelada'}`}>{r.stock}</span></td>
                      <td><div style={{display:'flex',gap:6}}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
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
              <span className="modal-title">{editing ? 'Editar Repuesto' : 'Nuevo Repuesto'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} /></div>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Costo ($)</label><input type="number" className="form-control" value={form.costo} onChange={e => setForm({...form, costo: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Stock</label><input type="number" className="form-control" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
              </div>
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
