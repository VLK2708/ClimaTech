# ❄️ ClimaTech - Sistema de Gestión de Climatización

Aplicación web fullstack para gestión de mantenimiento de equipos de climatización.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Base de datos | MySQL |
| Auth | JWT |
| Despliegue | Railway |

---

## 📁 Estructura del Proyecto

```
climatech/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración de BD
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── middlewares/   # Auth JWT, roles
│   │   ├── models/        # Modelos Sequelize
│   │   └── routes/        # Endpoints API
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Páginas por rol
│   │   └── services/      # Axios API
│   ├── .env.example
│   └── package.json
└── database/
    └── schema.sql         # Script SQL completo
```

---

## ⚡ Instalación Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/climatech.git
cd climatech
```

### 2. Configurar la Base de Datos
```bash
# Importar el schema en MySQL
mysql -u root -p < database/schema.sql
```

### 3. Configurar el Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de MySQL
npm install
npm run dev
# Servidor en http://localhost:3001
```

### 4. Configurar el Frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api
npm install
npm run dev
# App en http://localhost:5173
```

---

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@climatech.com | password123 |
| Técnico | tecnico@climatech.com | password123 |
| Cliente | cliente@climatech.com | password123 |

---

## 📡 Endpoints de la API

### Autenticación
```
POST /api/auth/login       # Iniciar sesión
POST /api/auth/registro    # Registrar usuario
GET  /api/auth/me          # Perfil actual
```

### Clientes (Admin)
```
GET    /api/clientes        # Listar
GET    /api/clientes/:id    # Ver uno
POST   /api/clientes        # Crear
PUT    /api/clientes/:id    # Actualizar
DELETE /api/clientes/:id    # Eliminar
```

### Técnicos (Admin)
```
GET    /api/tecnicos
POST   /api/tecnicos
PUT    /api/tecnicos/:id
DELETE /api/tecnicos/:id
```

### Equipos
```
GET    /api/equipos
POST   /api/equipos        # Admin
PUT    /api/equipos/:id    # Admin
DELETE /api/equipos/:id    # Admin
```

### Órdenes
```
GET    /api/ordenes              # Filtrado por rol
GET    /api/ordenes/:id
POST   /api/ordenes              # Admin/Cliente
PUT    /api/ordenes/:id          # Admin/Técnico
DELETE /api/ordenes/:id          # Admin
```

### Mantenimientos
```
GET    /api/mantenimientos
GET    /api/mantenimientos/:id
POST   /api/mantenimientos       # Admin/Técnico
PUT    /api/mantenimientos/:id   # Admin/Técnico
PUT    /api/mantenimientos/:id/confirmar
```

### Repuestos
```
GET    /api/repuestos
POST   /api/repuestos    # Admin
PUT    /api/repuestos/:id
DELETE /api/repuestos/:id
```

### Cotizaciones
```
GET    /api/cotizaciones
GET    /api/cotizaciones/:id
POST   /api/cotizaciones    # Admin
PUT    /api/cotizaciones/:id
```

### Dashboard
```
GET    /api/dashboard    # Admin only
```

---

## 🚀 Despliegue en Railway (Paso a Paso)

### Prerrequisitos
- Cuenta en [railway.app](https://railway.app)
- Repositorio en GitHub

---

### PASO 1: Subir el código a GitHub

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "feat: proyecto inicial climatech"
git remote add origin https://github.com/TU_USUARIO/climatech.git
git push -u origin main
```

---

### PASO 2: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) → **New Project**
2. Selecciona **"Deploy from GitHub repo"**
3. Autoriza GitHub y selecciona tu repositorio `climatech`

---

### PASO 3: Agregar MySQL en Railway

1. En tu proyecto Railway, haz clic en **"+ New"**
2. Selecciona **"Database" → "MySQL"**
3. Railway creará automáticamente las variables:
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
4. Haz clic en la base de datos → **"Connect"** → copia el `DATABASE_URL`

#### Importar el schema SQL:
```bash
# Desde tu PC, conectar a Railway MySQL
mysql -h HOST -P PUERTO -u USER -p DATABASE < database/schema.sql
```
O usa **TablePlus / DBeaver** con los datos de conexión de Railway.

---

### PASO 4: Configurar el Backend en Railway

1. En Railway, haz clic en **"+ New" → "GitHub Repo"** (el mismo repo)
2. Configura el **Root Directory**: `/backend`
3. En **Settings → Variables**, agrega:

```
NODE_ENV=production
JWT_SECRET=tu_clave_super_secreta_aqui_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.railway.app
DATABASE_URL=mysql://USER:PASS@HOST:PORT/DB
```

4. En **Settings → Deploy → Start Command**:
```
node src/index.js
```

5. Railway detectará el `package.json` automáticamente.

---

### PASO 5: Configurar el Frontend en Railway

1. Agrega otro servicio: **"+ New" → "GitHub Repo"** (mismo repo)
2. Root Directory: `/frontend`
3. Build Command: `npm run build`
4. Start Command: `npx serve dist -p $PORT`

> Instala serve: agrega `"serve": "^14.2.0"` a las dependencias del frontend.

5. Variables del frontend:
```
VITE_API_URL=https://tu-backend.railway.app/api
```

> **Importante**: El `VITE_API_URL` debe apuntar al dominio del backend desplegado.

---

### PASO 6: Obtener las URLs y conectar

1. En cada servicio Railway → **Settings → Domains → Generate Domain**
2. El backend tendrá algo como: `https://climatech-backend.up.railway.app`
3. El frontend: `https://climatech-frontend.up.railway.app`

4. Actualiza en el backend la variable `FRONTEND_URL` con la URL del frontend.
5. Actualiza en el frontend `VITE_API_URL` con la URL del backend + `/api`.
6. **Redeploy** ambos servicios.

---

### PASO 7: Verificar el despliegue

```bash
# Probar que el backend responde
curl https://tu-backend.railway.app/health

# Probar login
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@climatech.com","contrasena":"password123"}'
```

---

## 🔒 Variables de Entorno Completas

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=cambia_esto_por_algo_muy_seguro_32chars+
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.railway.app
```

### Frontend (.env)
```env
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## 🎯 Funcionalidades por Rol

### 👑 Administrador
- Dashboard con métricas y gráficos
- CRUD completo de clientes, técnicos, equipos, repuestos
- Gestión total de órdenes y mantenimientos
- Generación de cotizaciones
- Asignación de técnicos a órdenes

### 🔧 Técnico
- Ver órdenes asignadas
- Registrar mantenimientos (preventivo/correctivo)
- Agregar repuestos utilizados
- Subir URL de evidencia fotográfica
- Confirmar servicio completado

### 👤 Cliente
- Solicitar servicios (crear órdenes)
- Consultar estado de sus órdenes
- Ver sus equipos registrados
- Consultar cotizaciones

---

## 📊 Modelo de Base de Datos

```
usuarios ──────────────────────────────────────────────────
    │ 1                                                    │ 1
    │ n                                                    │ n
clientes ──── equipos ──── ordenes ──── mantenimientos     │
    │              │           │            │         tecnicos
    │              └───────────┘            │
    │                                       └──── detalle_repuestos ──── repuestos
    └──── cotizaciones ──── detalle_cotizaciones
```

---

## 🎁 Bonus implementado

- ✅ JWT Authentication completo
- ✅ Dashboard con gráficos (Chart.js - Doughnut + Bar)
- ✅ Manejo de roles a nivel de API y UI
- ✅ Filtros de estado en órdenes
- ✅ Cálculo automático de totales en cotizaciones
- ✅ Gestión de repuestos por mantenimiento

---

## 📞 Créditos

Proyecto desarrollado para ADSO SENA - Proyecto Final Desarrollo Web  
Entrega: 13 de abril de 2026
