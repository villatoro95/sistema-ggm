const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/dashboard', requireAuth, requireRole('admin'), (req, res) => {
  res.render('admin/dashboard', {
    title: 'Panel administrativo',
    currentUser: req.session.user,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

router.get('/students', requireAuth, requireRole('admin'), (req, res) => {
  res.render('admin/students', {
    title: 'Gestión de estudiantes',
    currentUser: req.session.user,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

module.exports = router;
