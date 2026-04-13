const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ========================
// USUARIO
// ========================
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  contrasena: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'tecnico', 'cliente'), defaultValue: 'cliente' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'usuarios', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// CLIENTE
// ========================
const Cliente = sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  telefono: { type: DataTypes.STRING(20) },
  direccion: { type: DataTypes.STRING(255) },
  usuario_id: { type: DataTypes.INTEGER }
}, { tableName: 'clientes', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// TECNICO
// ========================
const Tecnico = sequelize.define('Tecnico', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  especialidad: { type: DataTypes.STRING(100) },
  telefono: { type: DataTypes.STRING(20) },
  usuario_id: { type: DataTypes.INTEGER }
}, { tableName: 'tecnicos', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// EQUIPO
// ========================
const Equipo = sequelize.define('Equipo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.STRING(100), allowNull: false },
  marca: { type: DataTypes.STRING(100) },
  modelo: { type: DataTypes.STRING(100) },
  numero_serie: { type: DataTypes.STRING(100) },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'equipos', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// ORDEN
// ========================
const Orden = sequelize.define('Orden', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_programada: { type: DataTypes.DATEONLY },
  estado: { type: DataTypes.ENUM('pendiente', 'en_proceso', 'completada', 'cancelada'), defaultValue: 'pendiente' },
  descripcion: { type: DataTypes.TEXT },
  prioridad: { type: DataTypes.ENUM('baja', 'media', 'alta'), defaultValue: 'media' },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  tecnico_id: { type: DataTypes.INTEGER },
  equipo_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'ordenes', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// MANTENIMIENTO
// ========================
const Mantenimiento = sequelize.define('Mantenimiento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.ENUM('preventivo', 'correctivo'), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  evidencia_url: { type: DataTypes.STRING(500) },
  fecha_realizado: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  confirmado: { type: DataTypes.BOOLEAN, defaultValue: false },
  orden_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'mantenimientos', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// REPUESTO
// ========================
const Repuesto = sequelize.define('Repuesto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  costo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'repuestos', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// DETALLE REPUESTO
// ========================
const DetalleRepuesto = sequelize.define('DetalleRepuesto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  mantenimiento_id: { type: DataTypes.INTEGER, allowNull: false },
  repuesto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
  costo_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'detalle_repuestos', timestamps: true, createdAt: 'created_at', updatedAt: false });

// ========================
// COTIZACION
// ========================
const Cotizacion = sequelize.define('Cotizacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  estado: { type: DataTypes.ENUM('borrador', 'enviada', 'aprobada', 'rechazada'), defaultValue: 'borrador' },
  notas: { type: DataTypes.TEXT },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'cotizaciones', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ========================
// DETALLE COTIZACION
// ========================
const DetalleCotizacion = sequelize.define('DetalleCotizacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  descripcion: { type: DataTypes.STRING(255), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'detalle_cotizaciones', timestamps: false });

// ========================
// ASOCIACIONES
// ========================
Usuario.hasOne(Cliente, { foreignKey: 'usuario_id', as: 'cliente' });
Cliente.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Usuario.hasOne(Tecnico, { foreignKey: 'usuario_id', as: 'tecnico' });
Tecnico.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Cliente.hasMany(Equipo, { foreignKey: 'cliente_id', as: 'equipos' });
Equipo.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Cliente.hasMany(Orden, { foreignKey: 'cliente_id', as: 'ordenes' });
Orden.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Tecnico.hasMany(Orden, { foreignKey: 'tecnico_id', as: 'ordenes' });
Orden.belongsTo(Tecnico, { foreignKey: 'tecnico_id', as: 'tecnico' });

Equipo.hasMany(Orden, { foreignKey: 'equipo_id', as: 'ordenes' });
Orden.belongsTo(Equipo, { foreignKey: 'equipo_id', as: 'equipo' });

Orden.hasMany(Mantenimiento, { foreignKey: 'orden_id', as: 'mantenimientos' });
Mantenimiento.belongsTo(Orden, { foreignKey: 'orden_id', as: 'orden' });

Mantenimiento.hasMany(DetalleRepuesto, { foreignKey: 'mantenimiento_id', as: 'detalles' });
DetalleRepuesto.belongsTo(Mantenimiento, { foreignKey: 'mantenimiento_id', as: 'mantenimiento' });

Repuesto.hasMany(DetalleRepuesto, { foreignKey: 'repuesto_id', as: 'detalles' });
DetalleRepuesto.belongsTo(Repuesto, { foreignKey: 'repuesto_id', as: 'repuesto' });

Cliente.hasMany(Cotizacion, { foreignKey: 'cliente_id', as: 'cotizaciones' });
Cotizacion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Cotizacion.hasMany(DetalleCotizacion, { foreignKey: 'cotizacion_id', as: 'detalles' });
DetalleCotizacion.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id', as: 'cotizacion' });

module.exports = {
  sequelize,
  Usuario,
  Cliente,
  Tecnico,
  Equipo,
  Orden,
  Mantenimiento,
  Repuesto,
  DetalleRepuesto,
  Cotizacion,
  DetalleCotizacion
};
