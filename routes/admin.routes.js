const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/dashboard', requireAuth, (req, res) => {
  return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
});

router.get('/admin/dashboard', requireAuth, requireRole('admin'), (req, res) => {
  res.render('admin/dashboard', {
    title: 'Panel administrativo',
    currentUser: req.session.user,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

module.exports = router;
