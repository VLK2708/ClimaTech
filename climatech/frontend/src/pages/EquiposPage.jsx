import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const EMPTY = { tipo: '', marca: '', modelo: '', numero_serie: '', cliente_id: '' }

export default function EquiposPage() {
  const [equipos, setEquipos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'admin'

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/equipos'),
      isAdmin ? api.get('/clientes') : Promise.resolve({ data: { data: [] } })
    ]).then(([eq, cl]) => { setEquipos(eq.data.data || []); setClientes(cl.data.data || []) })
      .catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (e) => { setForm({ tipo: e.tipo, marca: e.marca || '', modelo: e.modelo || '', numero_serie: e.numero_serie || '', cliente_id: e.cliente_id }); setEditing(e); setModal(true) }

  const handleSave = async () => {
    if (!form.tipo.trim() || !form.cliente_id) return toast.error('Tipo y cliente son requeridos')
    setSaving(true)
    try {
      if (editing) { await api.put(`/equipos/${editing.id}`, form); toast.success('Equipo actualizado') }
      else { await api.post('/equipos', form); toast.success('Equipo registrado') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar equipo?')) return
    try { await api.delete(`/equipos/${id}`); toast.success('Eliminado'); load() } catch { toast.error('Error') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Equipos</h2><p className="page-subtitle">{equipos.length} registros</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Equipo</button>}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card" style={{padding:0}}>
          {equipos.length === 0 ? <div className="empty-state"><div className="icon">❄️</div><h3>Sin equipos</h3></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Tipo</th><th>Marca</th><th>Modelo</th><th>N° Serie</th><th>Cliente</th>{isAdmin && <th>Acciones</th>}</tr></thead>
                <tbody>
                  {equipos.map(e => (
                    <tr key={e.id}>
                      <td className="font-mono text-accent">{e.id}</td>
                      <td><strong>{e.tipo}</strong></td>
                      <td>{e.marca || '—'}</td>
                      <td>{e.modelo || '—'}</td>
                      <td className="font-mono text-sm">{e.numero_serie || '—'}</td>
                      <td>{e.cliente?.nombre || '—'}</td>
                      {isAdmin && <td><div style={{display:'flex',gap:6}}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(e)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>🗑️</button>
                      </div></td>}
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
              <span className="modal-title">{editing ? 'Editar Equipo' : 'Nuevo Equipo'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Tipo *</label><input className="form-control" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} placeholder="Aire Acondicionado Split" /></div>
              <div className="form-group"><label className="form-label">Marca</label><input className="form-control" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} placeholder="LG, Samsung, Carrier..." /></div>
              <div className="form-group"><label className="form-label">Modelo</label><input className="form-control" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Número de Serie</label><input className="form-control" value={form.numero_serie} onChange={e => setForm({...form, numero_serie: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Cliente *</label>
                <select className="form-control" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
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
