require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// MIDDLEWARES GLOBALES
// ========================
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: allowedOrigins
    ? (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('CORS: origen no permitido'));
      }
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// HEALTH CHECK
// ========================
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'ClimaTech API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

// ========================
// RUTAS API
// ========================
app.use('/api', routes);

// ========================
// MANEJO DE ERRORES 404
// ========================
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta ${req.path} no encontrada` });
});

// ========================
// MANEJO DE ERRORES GLOBALES
// ========================
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// ========================
// INICIAR SERVIDOR
// ========================
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Sync: solo crea tablas si no existen (compatible con MySQL)
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
