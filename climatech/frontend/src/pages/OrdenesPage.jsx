import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const makeEmpty = () => ({
  fecha: new Date().toISOString().split('T')[0],
  fecha_programada: '',
  descripcion: '',
  prioridad: 'media',
  cliente_id: '',
  tecnico_id: '',
  equipo_id: ''
})

const BADGE = {
  pendiente: 'badge-pendiente',
  en_proceso: 'badge-en_proceso',
  completada: 'badge-completada',
  cancelada: 'badge-cancelada'
}
const ESTADOS = ['pendiente', 'en_proceso', 'completada', 'cancelada']

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [clientes, setClientes] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [miPerfilId, setMiPerfilId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(makeEmpty())
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'admin'
  const isTecnico = usuario?.rol === 'tecnico'
  const isCliente = usuario?.rol === 'cliente'

  const load = async () => {
    setLoading(true)
    try {
      const ordRes = await api.get('/ordenes')
      setOrdenes(ordRes.data.data || [])

      if (isAdmin) {
        const [clientesRes, tecnicosRes, equiposRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/tecnicos'),
          api.get('/equipos')
        ])
        setClientes(clientesRes.data.data || [])
        setTecnicos(tecnicosRes.data.data || [])
        setEquipos(equiposRes.data.data || [])
      } else if (isCliente) {
        const meRes = await api.get('/auth/me')
        const perfilId = meRes.data?.perfil?.id
        setMiPerfilId(perfilId)
        if (perfilId) {
          const eqRes = await api.get('/equipos')
          setEquipos(eqRes.data.data || [])
        }
      }
    } catch (err) {
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (usuario) load() }, [usuario])

  const equiposFiltrados = isCliente
    ? equipos
    : (form.cliente_id ? equipos.filter(e => String(e.cliente_id) === String(form.cliente_id)) : equipos)

  const openCreate = () => {
    const empty = makeEmpty()
    if (isCliente && miPerfilId) empty.cliente_id = miPerfilId
    setForm(empty)
    setEditing(null)
    setModal(true)
  }

  const openEdit = (o) => {
    setForm({
      fecha: o.fecha,
      fecha_programada: o.fecha_programada || '',
      descripcion: o.descripcion || '',
      prioridad: o.prioridad,
      cliente_id: o.cliente_id,
      tecnico_id: o.tecnico_id || '',
      equipo_id: o.equipo_id
    })
    setEditing(o)
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.fecha || !form.cliente_id || !form.equipo_id) {
      return toast.error('Fecha, cliente y equipo son requeridos')
    }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/ordenes/${editing.id}`, form)
        toast.success('Orden actualizada')
      } else {
        await api.post('/ordenes', form)
        toast.success('Orden creada')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return
    try {
      await api.delete(`/ordenes/${id}`)
      toast.success('Eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const handleEstado = async (id, estado) => {
    try {
      await api.put(`/ordenes/${id}`, { estado })
      toast.success('Estado actualizado')
      load()
    } catch {
      toast.error('Error al actualizar estado')
    }
  }

  const filtradas = filtro === 'todos' ? ordenes : ordenes.filter(o => o.estado === filtro)

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Órdenes de Trabajo</h2>
          <p className="page-subtitle">{filtradas.length} de {ordenes.length} órdenes</p>
        </div>
        {(isAdmin || isCliente) && (
          <button className="btn btn-primary" onClick={openCreate}>+ Nueva Orden</button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['todos', ...ESTADOS].map(e => (
          <button
            key={e}
            className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltro(e)}
          >
            {e === 'todos' ? 'Todos' : e.replace('_', ' ')}
            {e !== 'todos' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                {ordenes.filter(o => o.estado === e).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtradas.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>Sin órdenes</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Equipo</th>
                    <th>Técnico</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono text-accent">#{o.id}</td>
                      <td><strong>{o.cliente?.nombre || '—'}</strong></td>
                      <td className="text-sm">
                        {o.equipo ? `${o.equipo.marca || ''} ${o.equipo.tipo}`.trim() : '—'}
                      </td>
                      <td>{o.tecnico?.nombre || <span className="text-muted">Sin asignar</span>}</td>
                      <td>
                        <span className={`badge ${
                          o.prioridad === 'alta' ? 'badge-cancelada' :
                          o.prioridad === 'media' ? 'badge-en_proceso' : 'badge-completada'
                        }`}>
                          {o.prioridad}
                        </span>
                      </td>
                      <td>
                        {(isAdmin || isTecnico) ? (
                          <select
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                            value={o.estado}
                            onChange={e => handleEstado(o.id, e.target.value)}
                          >
                            {ESTADOS.map(e => (
                              <option key={e} value={e}>{e.replace('_', ' ')}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`badge ${BADGE[o.estado]}`}>{o.estado}</span>
                        )}
                      </td>
                      <td className="text-muted text-sm">{o.fecha}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isAdmin && (
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(o)}>✏️</button>
                          )}
                          {isAdmin && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>🗑️</button>
                          )}
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
              <span className="modal-title">{editing ? 'Editar Orden' : 'Nueva Orden'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input type="date" className="form-control" value={form.fecha}
                    onChange={e => setForm({ ...form, fecha: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha programada</label>
                  <input type="date" className="form-control" value={form.fecha_programada}
                    onChange={e => setForm({ ...form, fecha_programada: e.target.value })} />
                </div>
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <select className="form-control" value={form.cliente_id}
                    onChange={e => setForm({ ...form, cliente_id: e.target.value, equipo_id: '' })}>
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Equipo *</label>
                <select className="form-control" value={form.equipo_id}
                  onChange={e => setForm({ ...form, equipo_id: e.target.value })}>
                  <option value="">Seleccionar equipo</option>
                  {equiposFiltrados.map(e => (
                    <option key={e.id} value={e.id}>{e.tipo} - {e.marca} {e.modelo}</option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label className="form-label">Técnico asignado</label>
                  <select className="form-control" value={form.tecnico_id}
                    onChange={e => setForm({ ...form, tecnico_id: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {tecnicos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre} - {t.especialidad}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select className="form-control" value={form.prioridad}
                  onChange={e => setForm({ ...form, prioridad: e.target.value })}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción del problema..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
