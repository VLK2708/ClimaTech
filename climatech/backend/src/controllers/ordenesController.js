const { Orden, Cliente, Tecnico, Equipo, Mantenimiento, Repuesto, DetalleRepuesto } = require('../models');

// GET /api/ordenes
const getOrdenes = async (req, res) => {
  try {
    const where = {};
    if (req.usuario.rol === 'tecnico') {
      const tecnico = await Tecnico.findOne({ where: { usuario_id: req.usuario.id } });
      if (tecnico) where.tecnico_id = tecnico.id;
    }
    if (req.usuario.rol === 'cliente') {
      const cliente = await Cliente.findOne({ where: { usuario_id: req.usuario.id } });
      if (cliente) where.cliente_id = cliente.id;
    }

    const ordenes = await Orden.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'telefono'] },
        { model: Tecnico, as: 'tecnico', attributes: ['id', 'nombre', 'especialidad'] },
        { model: Equipo, as: 'equipo', attributes: ['id', 'tipo', 'marca', 'modelo'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ ok: true, data: ordenes });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// GET /api/ordenes/:id
const getOrdenById = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Tecnico, as: 'tecnico' },
        { model: Equipo, as: 'equipo' },
        {
          model: Mantenimiento, as: 'mantenimientos',
          include: [{
            model: DetalleRepuesto, as: 'detalles',
            include: [{ model: Repuesto, as: 'repuesto' }]
          }]
        }
      ]
    });
    if (!orden) return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada' });
    res.json({ ok: true, data: orden });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// POST /api/ordenes
const createOrden = async (req, res) => {
  try {
    const { fecha, fecha_programada, descripcion, prioridad, cliente_id, tecnico_id, equipo_id } = req.body;
    if (!fecha || !cliente_id || !equipo_id) {
      return res.status(400).json({ ok: false, mensaje: 'Fecha, cliente y equipo son requeridos' });
    }
    const orden = await Orden.create({ fecha, fecha_programada, descripcion, prioridad, cliente_id, tecnico_id: tecnico_id || null, equipo_id });
    res.status(201).json({ ok: true, data: orden, mensaje: 'Orden creada exitosamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// PUT /api/ordenes/:id
const updateOrden = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada' });
    await orden.update(req.body);
    res.json({ ok: true, data: orden, mensaje: 'Orden actualizada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// DELETE /api/ordenes/:id
const deleteOrden = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ ok: false, mensaje: 'Orden no encontrada' });
    await orden.destroy();
    res.json({ ok: true, mensaje: 'Orden eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { getOrdenes, getOrdenById, createOrden, updateOrden, deleteOrden };
