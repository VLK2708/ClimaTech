import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const BADGE = {
  borrador: 'badge-borrador',
  enviada: 'badge-en_proceso',
  aprobada: 'badge-completada',
  rechazada: 'badge-cancelada'
}

const makeEmpty = () => ({
  fecha: new Date().toISOString().split('T')[0],
  notas: '',
  cliente_id: '',
  detalles: []
})

const EMPTY_ITEM = { descripcion: '', cantidad: 1, precio_unitario: '' }

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(makeEmpty())
  const [item, setItem] = useState(EMPTY_ITEM)
  const [saving, setSaving] = useState(false)
  const [verModal, setVerModal] = useState(null)
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'admin'

  const load = () => {
    setLoading(true)
    const reqs = [api.get('/cotizaciones')]
    if (isAdmin) reqs.push(api.get('/clientes'))
    Promise.all(reqs)
      .then(([c, cl]) => {
        setCotizaciones(c.data.data || [])
        if (cl) setClientes(cl.data.data || [])
      })
      .catch(() => toast.error('Error cargando cotizaciones'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const agregarItem = () => {
    if (!item.descripcion.trim() || !item.precio_unitario) return toast.error('Completa la descripción y precio')
    setForm(prev => ({ ...prev, detalles: [...prev.detalles, { ...item }] }))
    setItem(EMPTY_ITEM)
  }

  const quitarItem = (i) => setForm(prev => ({
    ...prev,
    detalles: prev.detalles.filter((_, idx) => idx !== i)
  }))

  const total = form.detalles.reduce((a, d) => a + (Number(d.precio_unitario) * Number(d.cantidad)), 0)

  const handleSave = async () => {
    if (!form.fecha || !form.cliente_id) return toast.error('Fecha y cliente son requeridos')
    setSaving(true)
    try {
      await api.post('/cotizaciones', form)
      toast.success('Cotización creada')
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleEstado = async (id, estado) => {
    try {
      await api.put(`/cotizaciones/${id}`, { estado })
      toast.success('Estado actualizado')
      load()
    } catch {
      toast.error('Error al actualizar estado')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Cotizaciones</h2>
          <p className="page-subtitle">{cotizaciones.length} registros</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setForm(makeEmpty()); setModal(true) }}>
            + Nueva Cotización
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {cotizaciones.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💰</div>
              <h3>Sin cotizaciones</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.map(c => (
                    <tr key={c.id}>
                      <td className="font-mono text-accent">{c.id}</td>
                      <td><strong>{c.cliente?.nombre || '—'}</strong></td>
                      <td className="text-muted text-sm">{c.fecha}</td>
                      <td className="font-mono">${Number(c.total).toLocaleString()}</td>
                      <td>
                        {isAdmin ? (
                          <select
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                            value={c.estado}
                            onChange={e => handleEstado(c.id, e.target.value)}
                          >
                            {['borrador', 'enviada', 'aprobada', 'rechazada'].map(e => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`badge ${BADGE[c.estado]}`}>{c.estado}</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setVerModal(c)}>
                          👁️ Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal crear */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <span className="modal-title">Nueva Cotización</span>
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
                  <label className="form-label">Cliente *</label>
                  <select className="form-control" value={form.cliente_id}
                    onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-control" value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  placeholder="Notas adicionales..." />
              </div>

              <div style={{ background: 'var(--bg3)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Ítems de la cotización</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <input className="form-control" placeholder="Descripción del servicio"
                    value={item.descripcion} onChange={e => setItem({ ...item, descripcion: e.target.value })} />
                  <input type="number" className="form-control" placeholder="Cant."
                    style={{ width: 70 }} min="1" value={item.cantidad}
                    onChange={e => setItem({ ...item, cantidad: e.target.value })} />
                  <input type="number" className="form-control" placeholder="Precio"
                    style={{ width: 110 }} min="0" value={item.precio_unitario}
                    onChange={e => setItem({ ...item, precio_unitario: e.target.value })} />
                  <button className="btn btn-outline" onClick={agregarItem}>+</button>
                </div>
                {form.detalles.length > 0 && (
                  <div>
                    {form.detalles.map((d, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span className="text-sm">{d.descripcion} × {d.cantidad}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="text-sm text-accent">
                            ${(Number(d.precio_unitario) * Number(d.cantidad)).toLocaleString()}
                          </span>
                          <button className="btn btn-danger btn-sm" onClick={() => quitarItem(i)}>×</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 700, fontSize: 16 }}>
                      Total: <span className="text-accent">${total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
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

      {/* Modal ver detalle */}
      {verModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setVerModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <span className="modal-title">Cotización #{verModal.id}</span>
              <button className="modal-close" onClick={() => setVerModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p className="text-muted text-sm">Cliente</p>
                  <p style={{ fontWeight: 600 }}>{verModal.cliente?.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Fecha</p>
                  <p style={{ fontWeight: 600 }}>{verModal.fecha}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Estado</p>
                  <span className={`badge ${BADGE[verModal.estado]}`}>{verModal.estado}</span>
                </div>
              </div>
              {verModal.notas && (
                <div style={{ background: 'var(--bg3)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13 }}>
                  {verModal.notas}
                </div>
              )}
              {verModal.detalles?.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '6px 0', textAlign: 'left', fontSize: 12, color: 'var(--text2)' }}>Descripción</th>
                      <th style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)' }}>Cant.</th>
                      <th style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>Precio</th>
                      <th style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verModal.detalles.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 0', fontSize: 13 }}>{d.descripcion}</td>
                        <td style={{ textAlign: 'center', fontSize: 13 }}>{d.cantidad}</td>
                        <td style={{ textAlign: 'right', fontSize: 13, fontFamily: 'var(--mono)' }}>
                          ${Number(d.precio_unitario).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 600 }}>
                          ${Number(d.subtotal).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', paddingTop: 12, fontWeight: 700 }}>TOTAL</td>
                      <td style={{ textAlign: 'right', paddingTop: 12, fontWeight: 700, fontSize: 16, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                        ${Number(verModal.total).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setVerModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
