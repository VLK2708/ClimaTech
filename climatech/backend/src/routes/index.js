const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Controllers
const authCtrl = require('../controllers/authController');
const clientesCtrl = require('../controllers/clientesController');
const tecnicosCtrl = require('../controllers/tecnicosController');
const equiposCtrl = require('../controllers/equiposController');
const ordenesCtrl = require('../controllers/ordenesController');
const mantenimientosCtrl = require('../controllers/mantenimientosController');
const repuestosCtrl = require('../controllers/repuestosController');
const cotizacionesCtrl = require('../controllers/cotizacionesController');
const dashboardCtrl = require('../controllers/dashboardController');

// ========================
// AUTH
// ========================
router.post('/auth/login', authCtrl.login);
router.post('/auth/registro', authCtrl.registro);
router.get('/auth/me', verificarToken, authCtrl.perfil);

// ========================
// DASHBOARD
// ========================
router.get('/dashboard', verificarToken, verificarRol('admin'), dashboardCtrl.getDashboard);

// ========================
// CLIENTES
// ========================
router.get('/clientes', verificarToken, verificarRol('admin'), clientesCtrl.getClientes);
router.get('/clientes/:id', verificarToken, clientesCtrl.getClienteById);
router.post('/clientes', verificarToken, verificarRol('admin'), clientesCtrl.createCliente);
router.put('/clientes/:id', verificarToken, verificarRol('admin'), clientesCtrl.updateCliente);
router.delete('/clientes/:id', verificarToken, verificarRol('admin'), clientesCtrl.deleteCliente);

// ========================
// TÉCNICOS
// ========================
router.get('/tecnicos', verificarToken, tecnicosCtrl.getTecnicos);
router.post('/tecnicos', verificarToken, verificarRol('admin'), tecnicosCtrl.createTecnico);
router.put('/tecnicos/:id', verificarToken, verificarRol('admin'), tecnicosCtrl.updateTecnico);
router.delete('/tecnicos/:id', verificarToken, verificarRol('admin'), tecnicosCtrl.deleteTecnico);

// ========================
// EQUIPOS
// ========================
router.get('/equipos', verificarToken, equiposCtrl.getEquipos);
router.post('/equipos', verificarToken, verificarRol('admin'), equiposCtrl.createEquipo);
router.put('/equipos/:id', verificarToken, verificarRol('admin'), equiposCtrl.updateEquipo);
router.delete('/equipos/:id', verificarToken, verificarRol('admin'), equiposCtrl.deleteEquipo);

// ========================
// ÓRDENES
// ========================
router.get('/ordenes', verificarToken, ordenesCtrl.getOrdenes);
router.get('/ordenes/:id', verificarToken, ordenesCtrl.getOrdenById);
router.post('/ordenes', verificarToken, verificarRol('admin', 'cliente'), ordenesCtrl.createOrden);
router.put('/ordenes/:id', verificarToken, verificarRol('admin', 'tecnico'), ordenesCtrl.updateOrden);
router.delete('/ordenes/:id', verificarToken, verificarRol('admin'), ordenesCtrl.deleteOrden);

// ========================
// MANTENIMIENTOS
// ========================
router.get('/mantenimientos', verificarToken, mantenimientosCtrl.getMantenimientos);
router.get('/mantenimientos/:id', verificarToken, mantenimientosCtrl.getMantenimientoById);
router.post('/mantenimientos', verificarToken, verificarRol('admin', 'tecnico'), mantenimientosCtrl.createMantenimiento);
router.put('/mantenimientos/:id', verificarToken, verificarRol('admin', 'tecnico'), mantenimientosCtrl.updateMantenimiento);
router.put('/mantenimientos/:id/confirmar', verificarToken, verificarRol('admin', 'tecnico'), mantenimientosCtrl.confirmarMantenimiento);

// ========================
// REPUESTOS
// ========================
router.get('/repuestos', verificarToken, repuestosCtrl.getRepuestos);
router.post('/repuestos', verificarToken, verificarRol('admin'), repuestosCtrl.createRepuesto);
router.put('/repuestos/:id', verificarToken, verificarRol('admin'), repuestosCtrl.updateRepuesto);
router.delete('/repuestos/:id', verificarToken, verificarRol('admin'), repuestosCtrl.deleteRepuesto);

// ========================
// COTIZACIONES
// ========================
router.get('/cotizaciones', verificarToken, cotizacionesCtrl.getCotizaciones);
router.get('/cotizaciones/:id', verificarToken, cotizacionesCtrl.getCotizacionById);
router.post('/cotizaciones', verificarToken, verificarRol('admin'), cotizacionesCtrl.createCotizacion);
router.put('/cotizaciones/:id', verificarToken, verificarRol('admin'), cotizacionesCtrl.updateCotizacion);

module.exports = router;
