require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Cliente, Tecnico, Equipo, Repuesto } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    await sequelize.sync({ force: false });

    const hash = await bcrypt.hash('password123', 10);

    // Usuarios
    const [admin] = await Usuario.findOrCreate({
      where: { email: 'admin@climatech.com' },
      defaults: { nombre: 'Administrador Sistema', contrasena: hash, rol: 'admin' }
    });
    const [tecUser] = await Usuario.findOrCreate({
      where: { email: 'tecnico@climatech.com' },
      defaults: { nombre: 'Carlos Técnico', contrasena: hash, rol: 'tecnico' }
    });
    const [cliUser] = await Usuario.findOrCreate({
      where: { email: 'cliente@climatech.com' },
      defaults: { nombre: 'María Cliente', contrasena: hash, rol: 'cliente' }
    });

    // Perfiles
    const [tecnico] = await Tecnico.findOrCreate({
      where: { usuario_id: tecUser.id },
      defaults: { nombre: 'Carlos Rodríguez', especialidad: 'Aires acondicionados split', telefono: '301-987-6543' }
    });
    const [cliente] = await Cliente.findOrCreate({
      where: { usuario_id: cliUser.id },
      defaults: { nombre: 'María González', telefono: '300-123-4567', direccion: 'Calle 45 #23-10, Barranquilla' }
    });

    // Equipo
    await Equipo.findOrCreate({
      where: { numero_serie: 'LG2024-001' },
      defaults: { tipo: 'Aire Acondicionado Split', marca: 'LG', modelo: 'Dual Inverter 18000 BTU', cliente_id: cliente.id }
    });

    // Repuestos
    const repuestos = [
      { nombre: 'Filtro HEPA', descripcion: 'Filtro de aire de alta eficiencia', costo: 45000, stock: 50 },
      { nombre: 'Gas refrigerante R410A', descripcion: 'Gas refrigerante para AA', costo: 85000, stock: 30 },
      { nombre: 'Condensador', descripcion: 'Condensador de reemplazo', costo: 250000, stock: 10 },
      { nombre: 'Compresor', descripcion: 'Compresor de alta eficiencia', costo: 450000, stock: 5 },
      { nombre: 'Control remoto universal', descripcion: 'Compatible con múltiples marcas', costo: 35000, stock: 20 },
    ];
    for (const r of repuestos) {
      await Repuesto.findOrCreate({ where: { nombre: r.nombre }, defaults: r });
    }

    console.log('✅ Seed completado exitosamente');
    console.log('📧 admin@climatech.com  | 🔑 password123');
    console.log('📧 tecnico@climatech.com | 🔑 password123');
    console.log('📧 cliente@climatech.com | 🔑 password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seed();
