const { Cotizacion, DetalleCotizacion, Cliente } = require('../models');

// GET /api/cotizaciones
const getCotizaciones = async (req, res) => {
  try {
    const where = {};
    if (req.usuario.rol === 'cliente') {
      const cliente = await Cliente.findOne({ where: { usuario_id: req.usuario.id } });
      if (cliente) where.cliente_id = cliente.id;
    }
    const cotizaciones = await Cotizacion.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
        { model: DetalleCotizacion, as: 'detalles' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ ok: true, data: cotizaciones });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// GET /api/cotizaciones/:id
const getCotizacionById = async (req, res) => {
  try {
    const cot = await Cotizacion.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: DetalleCotizacion, as: 'detalles' }
      ]
    });
    if (!cot) return res.status(404).json({ ok: false, mensaje: 'No encontrada' });
    res.json({ ok: true, data: cot });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// POST /api/cotizaciones
const createCotizacion = async (req, res) => {
  try {
    const { fecha, notas, cliente_id, detalles } = req.body;
    if (!fecha || !cliente_id) return res.status(400).json({ ok: false, mensaje: 'Fecha y cliente requeridos' });

    let total = 0;
    if (detalles) detalles.forEach(d => { total += (d.precio_unitario * (d.cantidad || 1)); });

    const cot = await Cotizacion.create({ fecha, total, notas, cliente_id });

    if (detalles && detalles.length > 0) {
      for (const d of detalles) {
        await DetalleCotizacion.create({
          cotizacion_id: cot.id,
          descripcion: d.descripcion,
          cantidad: d.cantidad || 1,
          precio_unitario: d.precio_unitario,
          subtotal: d.precio_unitario * (d.cantidad || 1)
        });
      }
    }
    res.status(201).json({ ok: true, data: cot, mensaje: 'Cotización creada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// PUT /api/cotizaciones/:id
const updateCotizacion = async (req, res) => {
  try {
    const cot = await Cotizacion.findByPk(req.params.id);
    if (!cot) return res.status(404).json({ ok: false, mensaje: 'No encontrada' });
    await cot.update(req.body);
    res.json({ ok: true, data: cot, mensaje: 'Cotización actualizada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { getCotizaciones, getCotizacionById, createCotizacion, updateCotizacion };
