// repuestosController.js
const { Repuesto } = require('../models');

const getRepuestos = async (req, res) => {
  try {
    const repuestos = await Repuesto.findAll({ order: [['nombre', 'ASC']] });
    res.json({ ok: true, data: repuestos });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const createRepuesto = async (req, res) => {
  try {
    const { nombre, descripcion, costo, stock } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Nombre requerido' });
    const repuesto = await Repuesto.create({ nombre, descripcion, costo, stock });
    res.status(201).json({ ok: true, data: repuesto, mensaje: 'Repuesto creado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const updateRepuesto = async (req, res) => {
  try {
    const r = await Repuesto.findByPk(req.params.id);
    if (!r) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await r.update(req.body);
    res.json({ ok: true, data: r, mensaje: 'Repuesto actualizado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const deleteRepuesto = async (req, res) => {
  try {
    const r = await Repuesto.findByPk(req.params.id);
    if (!r) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await r.destroy();
    res.json({ ok: true, mensaje: 'Repuesto eliminado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

module.exports = { getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto };
