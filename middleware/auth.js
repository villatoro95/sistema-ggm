const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
  }
  return res.redirect('/auth/login');
});

router.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

router.get('/dashboard', requireAuth, (req, res) => {
  return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
});

module.exports = router;
