const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cliente, Tecnico } = require('../models');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ where: { email, activo: true } });
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    // Obtener perfil según rol
    let perfil = null;
    if (usuario.rol === 'cliente') {
      perfil = await Cliente.findOne({ where: { usuario_id: usuario.id } });
    } else if (usuario.rol === 'tecnico') {
      perfil = await Tecnico.findOne({ where: { usuario_id: usuario.id } });
    }

    const token = generarToken(usuario);

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        perfil_id: perfil ? perfil.id : null
      }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// POST /api/auth/registro
const registro = async (req, res) => {
  try {
    const { nombre, email, contrasena, rol = 'cliente', telefono, direccion, especialidad } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre, email y contraseña son requeridos' });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ ok: false, mensaje: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({ nombre, email, contrasena: hash, rol });

    // Crear perfil según rol
    if (rol === 'cliente') {
      await Cliente.create({ nombre, telefono, direccion, usuario_id: usuario.id });
    } else if (rol === 'tecnico') {
      await Tecnico.create({ nombre, especialidad, telefono, usuario_id: usuario.id });
    }

    const token = generarToken(usuario);
    res.status(201).json({
      ok: true,
      mensaje: 'Usuario creado exitosamente',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error registro:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// GET /api/auth/me
const perfil = async (req, res) => {
  try {
    let extra = null;
    if (req.usuario.rol === 'cliente') {
      extra = await Cliente.findOne({ where: { usuario_id: req.usuario.id } });
    } else if (req.usuario.rol === 'tecnico') {
      extra = await Tecnico.findOne({ where: { usuario_id: req.usuario.id } });
    }
    res.json({ ok: true, usuario: req.usuario, perfil: extra });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = { login, registro, perfil };
