import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const EMPTY = { tipo: 'preventivo', descripcion: '', evidencia_url: '', orden_id: '', repuestos: [] }

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [repuestoSelec, setRepuestoSelec] = useState({ repuesto_id: '', cantidad: 1 })
  const [saving, setSaving] = useState(false)
  const { usuario } = useAuth()

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/mantenimientos'), api.get('/ordenes'), api.get('/repuestos')])
      .then(([m, o, r]) => { setMantenimientos(m.data.data || []); setOrdenes(o.data.data || []); setRepuestos(r.data.data || []) })
      .catch(() => toast.error('Error')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const agregarRepuesto = () => {
    if (!repuestoSelec.repuesto_id) return
    const rep = repuestos.find(r => String(r.id) === String(repuestoSelec.repuesto_id))
    if (!rep) return
    setForm(prev => ({ ...prev, repuestos: [...prev.repuestos, { ...repuestoSelec, nombre: rep.nombre, costo: rep.costo }] }))
    setRepuestoSelec({ repuesto_id: '', cantidad: 1 })
  }

  const quitarRepuesto = (i) => setForm(prev => ({ ...prev, repuestos: prev.repuestos.filter((_, idx) => idx !== i) }))

  const handleSave = async () => {
    if (!form.tipo || !form.orden_id) return toast.error('Tipo y orden son requeridos')
    setSaving(true)
    try {
      await api.post('/mantenimientos', form)
      toast.success('Mantenimiento registrado')
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error') } finally { setSaving(false) }
  }

  const confirmar = async (id) => {
    try { await api.put(`/mantenimientos/${id}/confirmar`); toast.success('Confirmado'); load() } catch { toast.error('Error') }
  }

  const ordenesDisponibles = ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso')

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Mantenimientos</h2><p className="page-subtitle">{mantenimientos.length} registros</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Registrar</button>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card" style={{padding:0}}>
          {mantenimientos.length === 0 ? <div className="empty-state"><div className="icon">🛠️</div><h3>Sin mantenimientos</h3></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Orden</th><th>Tipo</th><th>Descripción</th><th>Evidencia</th><th>Confirmado</th><th>Fecha</th><th>Acciones</th></tr></thead>
                <tbody>
                  {mantenimientos.map(m => (
                    <tr key={m.id}>
                      <td className="font-mono text-accent">{m.id}</td>
                      <td className="font-mono">#{m.orden_id}</td>
                      <td><span className={`badge badge-${m.tipo}`}>{m.tipo}</span></td>
                      <td className="text-sm" style={{maxWidth:200}}>{m.descripcion || '—'}</td>
                      <td>{m.evidencia_url ? <a href={m.evidencia_url} target="_blank" className="text-accent text-sm">Ver imagen</a> : '—'}</td>
                      <td><span className={`badge ${m.confirmado ? 'badge-completada' : 'badge-pendiente'}`}>{m.confirmado ? '✓ Sí' : 'No'}</span></td>
                      <td className="text-muted text-sm">{new Date(m.fecha_realizado).toLocaleDateString()}</td>
                      <td>
                        {!m.confirmado && (
                          <button className="btn btn-success btn-sm" onClick={() => confirmar(m.id)}>✓ Confirmar</button>
                        )}
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
          <div className="modal" style={{maxWidth:620}}>
            <div className="modal-header">
              <span className="modal-title">Registrar Mantenimiento</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Orden de Trabajo *</label>
                <select className="form-control" value={form.orden_id} onChange={e => setForm({...form, orden_id: e.target.value})}>
                  <option value="">Seleccionar orden</option>
                  {ordenesDisponibles.map(o => <option key={o.id} value={o.id}>#{o.id} - {o.cliente?.nombre} ({o.estado})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Tipo *</label>
                <select className="form-control" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Descripción del trabajo</label><textarea className="form-control" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Describe el trabajo realizado..." /></div>
              <div className="form-group"><label className="form-label">URL de Evidencia (imagen)</label><input className="form-control" value={form.evidencia_url} onChange={e => setForm({...form, evidencia_url: e.target.value})} placeholder="https://..." /></div>

              {/* Repuestos */}
              <div style={{background:'var(--bg3)', padding:16, borderRadius:'var(--radius-sm)', marginTop:8}}>
                <p style={{fontWeight:600, marginBottom:12, fontSize:13}}>Repuestos utilizados</p>
                <div style={{display:'flex', gap:8, marginBottom:8}}>
                  <select className="form-control" style={{flex:1}} value={repuestoSelec.repuesto_id} onChange={e => setRepuestoSelec({...repuestoSelec, repuesto_id: e.target.value})}>
                    <option value="">Seleccionar repuesto</option>
                    {repuestos.map(r => <option key={r.id} value={r.id}>{r.nombre} - ${Number(r.costo).toLocaleString()}</option>)}
                  </select>
                  <input type="number" className="form-control" style={{width:80}} min="1" value={repuestoSelec.cantidad} onChange={e => setRepuestoSelec({...repuestoSelec, cantidad: e.target.value})} />
                  <button className="btn btn-outline btn-sm" onClick={agregarRepuesto}>+</button>
                </div>
                {form.repuestos.length > 0 && (
                  <div>
                    {form.repuestos.map((r, i) => (
                      <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--border)'}}>
                        <span className="text-sm">{r.nombre} × {r.cantidad}</span>
                        <div style={{display:'flex', gap:8, alignItems:'center'}}>
                          <span className="text-sm text-accent">${(Number(r.costo) * r.cantidad).toLocaleString()}</span>
                          <button className="btn btn-danger btn-sm" onClick={() => quitarRepuesto(i)}>×</button>
                        </div>
                      </div>
                    ))}
                    <div style={{textAlign:'right', marginTop:8, fontWeight:700}}>
                      Total: <span className="text-accent">${form.repuestos.reduce((a, r) => a + Number(r.costo) * r.cantidad, 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Registrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
