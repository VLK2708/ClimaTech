import { useState, useEffect } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js'
import api from '../services/api'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#8899bb', font: { family: 'Sora' } } } }
}

const BADGE_ESTADO = {
  pendiente: 'badge-pendiente',
  en_proceso: 'badge-en_proceso',
  completada: 'badge-completada',
  cancelada: 'badge-cancelada'
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Error cargando dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Cargando dashboard...</span></div>
  if (!data) return null

  const { resumen, estadisticasEstado, ordenesRecientes, tecnicosTop } = data

  const doughnutData = {
    labels: estadisticasEstado.map(e => e.estado),
    datasets: [{
      data: estadisticasEstado.map(e => e.cantidad),
      backgroundColor: estadisticasEstado.map(e => e.color),
      borderWidth: 0
    }]
  }

  const barData = {
    labels: tecnicosTop.map(t => t.tecnico?.nombre || 'N/A'),
    datasets: [{
      label: 'Órdenes',
      data: tecnicosTop.map(t => Number(t.total_ordenes) || 0),
      backgroundColor: 'rgba(0,212,255,0.6)',
      borderColor: 'rgba(0,212,255,1)',
      borderWidth: 1,
      borderRadius: 6
    }]
  }

  const STATS = [
    { label: 'Clientes', value: resumen.totalClientes, icon: '👥', color: 'rgba(136,102,255,0.2)' },
    { label: 'Técnicos', value: resumen.totalTecnicos, icon: '🔧', color: 'rgba(0,212,255,0.2)' },
    { label: 'Equipos', value: resumen.totalEquipos, icon: '❄️', color: 'rgba(0,229,160,0.2)' },
    { label: 'Total Órdenes', value: resumen.totalOrdenes, icon: '📋', color: 'rgba(255,184,0,0.2)' },
    { label: 'Mantenimientos', value: resumen.totalMantenimientos, icon: '🛠️', color: 'rgba(255,136,0,0.2)' },
    { label: 'Cotiz. Aprobadas', value: resumen.cotizacionesAprobadas, icon: '💰', color: 'rgba(0,229,160,0.2)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>
      </div>

      <div className="grid grid-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 mb-6">
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Estado de Órdenes</h3>
          <Doughnut data={doughnutData} options={CHART_OPTS} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Técnicos con Más Órdenes</h3>
          {tecnicosTop.length > 0 ? (
            <Bar data={barData} options={{
              ...CHART_OPTS,
              plugins: { ...CHART_OPTS.plugins, legend: { display: false } },
              scales: {
                x: { ticks: { color: '#8899bb' } },
                y: { ticks: { color: '#8899bb' }, grid: { color: '#2a3a5c' } }
              }
            }} />
          ) : (
            <div className="empty-state">
              <div className="icon">📊</div>
              <p>Sin datos de técnicos aún</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>Órdenes Recientes (últimos 7 días)</h3>
        {ordenesRecientes.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>Sin órdenes recientes</h3>
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
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ordenesRecientes.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono text-accent">#{o.id}</td>
                    <td>{o.cliente?.nombre || '—'}</td>
                    <td>{o.equipo ? `${o.equipo.marca || ''} ${o.equipo.tipo}`.trim() : '—'}</td>
                    <td>{o.tecnico?.nombre || <span className="text-muted">Sin asignar</span>}</td>
                    <td><span className={`badge ${BADGE_ESTADO[o.estado]}`}>{o.estado}</span></td>
                    <td>
                      <span className={`badge ${
                        o.prioridad === 'alta' ? 'badge-cancelada' :
                        o.prioridad === 'media' ? 'badge-en_proceso' : 'badge-completada'
                      }`}>{o.prioridad}</span>
                    </td>
                    <td className="text-muted text-sm">{o.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
