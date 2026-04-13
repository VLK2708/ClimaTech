-- ============================================================
-- CLIMATECH - Sistema de Gestión de Mantenimiento de Climatización
-- Script SQL completo
-- ============================================================

CREATE DATABASE IF NOT EXISTS climatech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE climatech_db;

-- ========================
-- TABLA: usuarios
-- ========================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'tecnico', 'cliente') NOT NULL DEFAULT 'cliente',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: clientes
-- ========================
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  usuario_id INT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ========================
-- TABLA: tecnicos
-- ========================
CREATE TABLE tecnicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100),
  telefono VARCHAR(20),
  usuario_id INT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ========================
-- TABLA: equipos
-- ========================
CREATE TABLE equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(100) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100),
  cliente_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- ========================
-- TABLA: ordenes
-- ========================
CREATE TABLE ordenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  fecha_programada DATE,
  estado ENUM('pendiente', 'en_proceso', 'completada', 'cancelada') DEFAULT 'pendiente',
  descripcion TEXT,
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  cliente_id INT NOT NULL,
  tecnico_id INT,
  equipo_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE SET NULL,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- ========================
-- TABLA: mantenimientos
-- ========================
CREATE TABLE mantenimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('preventivo', 'correctivo') NOT NULL,
  descripcion TEXT,
  evidencia_url VARCHAR(500),
  fecha_realizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmado TINYINT(1) DEFAULT 0,
  orden_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
);

-- ========================
-- TABLA: repuestos
-- ========================
CREATE TABLE repuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================
-- TABLA: detalle_repuestos
-- ========================
CREATE TABLE detalle_repuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mantenimiento_id INT NOT NULL,
  repuesto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos(id) ON DELETE CASCADE,
  FOREIGN KEY (repuesto_id) REFERENCES repuestos(id)
);

-- ========================
-- TABLA: cotizaciones
-- ========================
CREATE TABLE cotizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) DEFAULT 0.00,
  estado ENUM('borrador', 'enviada', 'aprobada', 'rechazada') DEFAULT 'borrador',
  notas TEXT,
  cliente_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- ========================
-- TABLA: detalle_cotizaciones
-- ========================
CREATE TABLE detalle_cotizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad INT DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
);

-- ========================
-- DATOS INICIALES (SEED)
-- ========================

-- Contraseña para todos: "password123" (bcrypt hash)
INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES
('Administrador Sistema', 'admin@climatech.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Carlos Técnico', 'tecnico@climatech.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tecnico'),
('María Cliente', 'cliente@climatech.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente');

INSERT INTO clientes (nombre, telefono, direccion, usuario_id) VALUES
('María González', '300-123-4567', 'Calle 45 #23-10, Barranquilla', 3);

INSERT INTO tecnicos (nombre, especialidad, telefono, usuario_id) VALUES
('Carlos Rodríguez', 'Aires acondicionados split', '301-987-6543', 2);

INSERT INTO equipos (tipo, marca, modelo, numero_serie, cliente_id) VALUES
('Aire Acondicionado Split', 'LG', 'Dual Inverter 18000 BTU', 'LG2024-001', 1);

INSERT INTO repuestos (nombre, descripcion, costo, stock) VALUES
('Filtro HEPA', 'Filtro de aire de alta eficiencia', 45000, 50),
('Gas refrigerante R410A', 'Gas refrigerante para AA', 85000, 30),
('Condensador', 'Condensador de reemplazo', 250000, 10),
('Compresor', 'Compresor de alta eficiencia', 450000, 5),
('Control remoto universal', 'Compatible con múltiples marcas', 35000, 20);
