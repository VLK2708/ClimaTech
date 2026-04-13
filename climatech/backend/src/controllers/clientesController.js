const bcrypt = require('bcryptjs');
const { Cliente, Usuario, Equipo, Orden } = require('../models');

// GET /api/clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['email', 'activo'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ ok: true, data: clientes });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// GET /api/clientes/:id
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['email', 'activo'] },
        { model: Equipo, as: 'equipos' }
      ]
    });
    if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, data: cliente });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// POST /api/clientes
const createCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion, email, contrasena } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Nombre es requerido' });

    let usuario_id = null;
    if (email && contrasena) {
      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ ok: false, mensaje: 'Email ya registrado' });
      const hash = await bcrypt.hash(contrasena, 10);
      const usuario = await Usuario.create({ nombre, email, contrasena: hash, rol: 'cliente' });
      usuario_id = usuario.id;
    }

    const cliente = await Cliente.create({ nombre, telefono, direccion, usuario_id });
    res.status(201).json({ ok: true, data: cliente, mensaje: 'Cliente creado exitosamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// PUT /api/clientes/:id
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    await cliente.update(req.body);
    res.json({ ok: true, data: cliente, mensaje: 'Cliente actualizado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// DELETE /api/clientes/:id
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    await cliente.destroy();
    res.json({ ok: true, mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { getClientes, getClienteById, createCliente, updateCliente, deleteCliente };
