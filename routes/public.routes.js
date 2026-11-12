const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/dashboard', requireAuth, requireRole('teacher'), (req, res) => {
  res.render('teacher/dashboard', {
    title: 'Panel docente',
    currentUser: req.session.user,
    csrfToken: req.csrfToken ? req.csrfToken() : ''
  });
});

module.exports = router;
