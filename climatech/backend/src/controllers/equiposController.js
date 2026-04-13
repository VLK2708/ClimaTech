// equiposController.js
const { Equipo, Cliente } = require('../models');

const getEquipos = async (req, res) => {
  try {
    const where = {};
    if (req.usuario.rol === 'cliente') {
      const cliente = await Cliente.findOne({ where: { usuario_id: req.usuario.id } });
      if (cliente) where.cliente_id = cliente.id;
    }
    const equipos = await Equipo.findAll({
      where,
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ ok: true, data: equipos });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const createEquipo = async (req, res) => {
  try {
    const { tipo, marca, modelo, numero_serie, cliente_id } = req.body;
    if (!tipo || !cliente_id) return res.status(400).json({ ok: false, mensaje: 'Tipo y cliente requeridos' });
    const equipo = await Equipo.create({ tipo, marca, modelo, numero_serie, cliente_id });
    res.status(201).json({ ok: true, data: equipo, mensaje: 'Equipo registrado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const updateEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id);
    if (!equipo) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await equipo.update(req.body);
    res.json({ ok: true, data: equipo, mensaje: 'Equipo actualizado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const deleteEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findByPk(req.params.id);
    if (!equipo) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await equipo.destroy();
    res.json({ ok: true, mensaje: 'Equipo eliminado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

module.exports = { getEquipos, createEquipo, updateEquipo, deleteEquipo };
