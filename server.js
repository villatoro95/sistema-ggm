const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const db = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const teacherRoutes = require('./routes/teacher.routes');
const publicRoutes = require('./routes/public.routes');
const { ensureAdminUser } = require('./scripts/init-db');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
      connectSrc: ["'self'"],
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ccggm_academico',
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'ccggm-secret-change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 2 * 60 * 60 * 1000
  }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente más tarde.'
}));

app.use(csrf({ cookie: false }));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  res.locals.currentUser = req.session.user || null;
  res.locals.isProduction = isProduction;
  next();
});

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página no encontrada',
    message: 'La página que buscas no existe o no tiene acceso.',
    currentUser: req.session?.user || null
  });
});

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).render('error', {
    title: 'Error del servidor',
    message: isProduction ? 'Ocurrió un error interno. Contacta al administrador.' : err.message,
    currentUser: req.session?.user || null
  });
});

async function startServer() {
  try {
    await db.testConnection();
    await ensureAdminUser();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor CCGGM ejecutándose en http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
