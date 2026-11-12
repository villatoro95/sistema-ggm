const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { requireAuth, requireGuest } = require('../middleware/auth');

router.get('/login', requireGuest, (req, res) => {
  res.render('login', {
    title: 'Iniciar sesión',
    error: null,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

router.post('/login', requireGuest, [
  body('username').trim().notEmpty().withMessage('Usuario requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], authController.login);

router.get('/logout', requireAuth, authController.logout);

router.get('/change-password', requireAuth, (req, res) => {
  if (!req.session.user?.must_change_password) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
  }

  res.render('change-password', {
    title: 'Actualizar contraseña',
    error: null,
    currentUser: req.session.user,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

router.post('/change-password', requireAuth, [
  body('newPassword').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
], authController.changePassword);

module.exports = router;
