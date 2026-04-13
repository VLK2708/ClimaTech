const { Orden, Cliente, Tecnico, Equipo, Mantenimiento, Cotizacion, sequelize } = require('../models');
const { Op } = require('sequelize');

const getDashboard = async (req, res) => {
  try {
    const [
      totalClientes,
      totalTecnicos,
      totalEquipos,
      ordenesPendientes,
      ordenesEnProceso,
      ordenesCompletadas,
      totalesCanceladas,
      totalMantenimientos,
      cotizacionesAprobadas
    ] = await Promise.all([
      Cliente.count(),
      Tecnico.count(),
      Equipo.count(),
      Orden.count({ where: { estado: 'pendiente' } }),
      Orden.count({ where: { estado: 'en_proceso' } }),
      Orden.count({ where: { estado: 'completada' } }),
      Orden.count({ where: { estado: 'cancelada' } }),
      Mantenimiento.count(),
      Cotizacion.count({ where: { estado: 'aprobada' } })
    ]);

    // Órdenes de los últimos 7 días
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const ordenesRecientes = await Orden.findAll({
      where: { created_at: { [Op.gte]: hace7Dias } },
      include: [
        { model: Cliente, as: 'cliente', attributes: ['nombre'] },
        { model: Tecnico, as: 'tecnico', attributes: ['nombre'] },
        { model: Equipo, as: 'equipo', attributes: ['tipo', 'marca'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Distribución por estado
    const estadisticasEstado = [
      { estado: 'Pendiente', cantidad: ordenesPendientes, color: '#F59E0B' },
      { estado: 'En Proceso', cantidad: ordenesEnProceso, color: '#3B82F6' },
      { estado: 'Completada', cantidad: ordenesCompletadas, color: '#10B981' },
      { estado: 'Cancelada', cantidad: totalesCanceladas, color: '#EF4444' }
    ];

    // Técnicos con más órdenes
    const topRaw = await sequelize.query(
      `SELECT o.tecnico_id, COUNT(o.id) AS total_ordenes,
              t.nombre, t.especialidad
       FROM ordenes o
       INNER JOIN tecnicos t ON t.id = o.tecnico_id
       WHERE o.tecnico_id IS NOT NULL
       GROUP BY o.tecnico_id, t.nombre, t.especialidad
       ORDER BY total_ordenes DESC
       LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const tecnicosTop = topRaw.map(r => ({
      tecnico_id: r.tecnico_id,
      total_ordenes: r.total_ordenes,
      tecnico: { nombre: r.nombre, especialidad: r.especialidad }
    }));

    res.json({
      ok: true,
      data: {
        resumen: {
          totalClientes,
          totalTecnicos,
          totalEquipos,
          totalOrdenes: ordenesPendientes + ordenesEnProceso + ordenesCompletadas + totalesCanceladas,
          totalMantenimientos,
          cotizacionesAprobadas
        },
        estadisticasEstado,
        ordenesRecientes,
        tecnicosTop
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { getDashboard };
