const { Mantenimiento, DetalleRepuesto, Repuesto, Orden } = require('../models');

// GET /api/mantenimientos
const getMantenimientos = async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.findAll({
      include: [
        { model: Orden, as: 'orden', attributes: ['id', 'estado', 'fecha'] },
        { model: DetalleRepuesto, as: 'detalles',
          include: [{ model: Repuesto, as: 'repuesto' }] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ ok: true, data: mantenimientos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// GET /api/mantenimientos/:id
const getMantenimientoById = async (req, res) => {
  try {
    const m = await Mantenimiento.findByPk(req.params.id, {
      include: [
        { model: Orden, as: 'orden' },
        { model: DetalleRepuesto, as: 'detalles', include: [{ model: Repuesto, as: 'repuesto' }] }
      ]
    });
    if (!m) return res.status(404).json({ ok: false, mensaje: 'Mantenimiento no encontrado' });
    res.json({ ok: true, data: m });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// POST /api/mantenimientos
const createMantenimiento = async (req, res) => {
  try {
    const { tipo, descripcion, evidencia_url, orden_id, repuestos } = req.body;
    if (!tipo || !orden_id) {
      return res.status(400).json({ ok: false, mensaje: 'Tipo y orden son requeridos' });
    }

    const mantenimiento = await Mantenimiento.create({ tipo, descripcion, evidencia_url, orden_id });

    // Agregar repuestos si vienen
    if (repuestos && repuestos.length > 0) {
      for (const r of repuestos) {
        const repuesto = await Repuesto.findByPk(r.repuesto_id);
        if (repuesto) {
          await DetalleRepuesto.create({
            mantenimiento_id: mantenimiento.id,
            repuesto_id: r.repuesto_id,
            cantidad: r.cantidad || 1,
            costo_unitario: repuesto.costo
          });
        }
      }
    }

    // Actualizar estado de la orden
    await Orden.update({ estado: 'en_proceso' }, { where: { id: orden_id } });

    res.status(201).json({ ok: true, data: mantenimiento, mensaje: 'Mantenimiento registrado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// PUT /api/mantenimientos/:id/confirmar
const confirmarMantenimiento = async (req, res) => {
  try {
    const m = await Mantenimiento.findByPk(req.params.id);
    if (!m) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await m.update({ confirmado: true });
    // Marcar orden como completada
    await Orden.update({ estado: 'completada' }, { where: { id: m.orden_id } });
    res.json({ ok: true, mensaje: 'Mantenimiento confirmado y orden completada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// PUT /api/mantenimientos/:id
const updateMantenimiento = async (req, res) => {
  try {
    const m = await Mantenimiento.findByPk(req.params.id);
    if (!m) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await m.update(req.body);
    res.json({ ok: true, data: m, mensaje: 'Mantenimiento actualizado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { getMantenimientos, getMantenimientoById, createMantenimiento, confirmarMantenimiento, updateMantenimiento };
