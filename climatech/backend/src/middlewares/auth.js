const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ ok: false, mensaje: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['contrasena'] }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'Token inválido o usuario inactivo' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, mensaje: 'Token expirado o inválido' });
  }
};

// Verificar roles
const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para esta acción' });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
