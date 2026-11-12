# Sistema académico CCGGM

Sistema académico del Colegio Cristiano Licenciado Guillermo González Martínez (CCGGM), desarrollado con Node.js, Express, MySQL, EJS y Bootstrap 5.

## Requisitos

- Node.js LTS 18+
- MySQL 8+
- Git
- Cuenta en Hostinger Business para despliegue

## Instalación local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/<usuario>/ccggm-sistema-academico.git
   cd ccggm-sistema-academico
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Crea la base de datos en MySQL:
   ```sql
   CREATE DATABASE ccggm_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Crea el archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Ajusta los valores reales de la conexión MySQL y la sesión.

6. Inicializa la base de datos y el usuario administrador:
   ```bash
   npm run db:init
   ```

7. Inicia el servidor:
   ```bash
   npm start
   ```

La aplicación estará disponible en:

```bash
http://localhost:3000
```

## Usuario administrador inicial

- Usuario: `colegioCCGGM`
- Contraseña inicial: `CCGGM01`
- Se fuerza el cambio obligatorio de contraseña al primer inicio de sesión.

## Variables de entorno

Ejemplo de configuración:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=tu_clave_secreta
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ccggm_academico
DB_CONNECTION_LIMIT=10
```

## GitHub + Hostinger

### GitHub

1. Crea un repositorio privado en GitHub.
2. Conecta tu repositorio local con el remoto.
3. Sube el proyecto:
   ```bash
   git init
   git add .
   git commit -m "Sistema académico inicial"
   git branch -M main
   git remote add origin https://github.com/<usuario>/ccggm-sistema-academico.git
   git push -u origin main
   ```
4. No subas el archivo `.env` con credenciales reales.

### Hostinger Business

1. En Hostinger, crea una aplicación Node.js o un sitio con Node.js.
2. Conecta el repositorio de GitHub.
3. Define las variables de entorno de producción:
   - `NODE_ENV=production`
   - `PORT=3000` o el puerto que asigne Hostinger
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `SESSION_SECRET`
4. Configura la base de datos MySQL de Hostinger y enlázala con la app.
5. Reinicia la aplicación y valida que arranque correctamente.

## Seguridad implementada

- Bcrypt para contraseñas.
- Sesiones guardadas en MySQL.
- Helmet.
- CSRF.
- Rate limiting.
- Validación con express-validator.
- Protección de rutas por rol.
- Variables de entorno.

## Estructura principal

- `server.js` — entrada principal
- `config/db.js` — configuración del pool MySQL
- `routes/` — endpoints
- `controllers/` — lógica de autenticación
- `views/` — plantillas EJS
- `middleware/` — autenticación y roles
- `database/schema.sql` — esquema inicial

## Nota

La base del sistema ya está preparada para autenticación, roles y despliegue. Los módulos académicos más avanzados (estudiantes, docentes, notas, exportación, reportes, Excel/PDF) deben continuarse sobre esta base con la lógica específica del colegio.
