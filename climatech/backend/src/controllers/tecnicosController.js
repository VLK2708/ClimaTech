// tecnicosController.js
const { Tecnico, Usuario, Orden } = require('../models');
const bcrypt = require('bcryptjs');

const getTecnicos = async (req, res) => {
  try {
    const tecnicos = await Tecnico.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['email', 'activo'] }],
      order: [['nombre', 'ASC']]
    });
    res.json({ ok: true, data: tecnicos });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const createTecnico = async (req, res) => {
  try {
    const { nombre, especialidad, telefono, email, contrasena } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Nombre requerido' });

    let usuario_id = null;
    if (email && contrasena) {
      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ ok: false, mensaje: 'Email ya registrado' });
      const hash = await bcrypt.hash(contrasena, 10);
      const usuario = await Usuario.create({ nombre, email, contrasena: hash, rol: 'tecnico' });
      usuario_id = usuario.id;
    }
    const tecnico = await Tecnico.create({ nombre, especialidad, telefono, usuario_id });
    res.status(201).json({ ok: true, data: tecnico, mensaje: 'Técnico registrado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const updateTecnico = async (req, res) => {
  try {
    const tecnico = await Tecnico.findByPk(req.params.id);
    if (!tecnico) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await tecnico.update(req.body);
    res.json({ ok: true, data: tecnico, mensaje: 'Técnico actualizado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

const deleteTecnico = async (req, res) => {
  try {
    const tecnico = await Tecnico.findByPk(req.params.id);
    if (!tecnico) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    await tecnico.destroy();
    res.json({ ok: true, mensaje: 'Técnico eliminado' });
  } catch (error) { res.status(500).json({ ok: false, mensaje: error.message }); }
};

module.exports = { getTecnicos, createTecnico, updateTecnico, deleteTecnico };
