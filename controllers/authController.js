const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('login', {
      title: 'Iniciar sesión',
      error: 'Usuario y contraseña requeridos.',
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  }

  const { username, password } = req.body;
  const rows = await db.query(
    'SELECT * FROM users WHERE username = ? AND status = ? LIMIT 1',
    [username.trim(), 'active']
  );

  if (!rows.length) {
    return res.status(401).render('login', {
      title: 'Iniciar sesión',
      error: 'Credenciales incorrectas.',
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).render('login', {
      title: 'Iniciar sesión',
      error: 'Credenciales incorrectas.',
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    full_name: user.full_name,
    must_change_password: Boolean(user.must_change_password)
  };

  await db.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  if (user.must_change_password) {
    return res.redirect('/auth/change-password');
  }

  return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
}

async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('change-password', {
      title: 'Cambiar contraseña',
      error: 'La nueva contraseña debe tener al menos 8 caracteres.',
      currentUser: req.session.user || null,
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  }

  const { newPassword } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.redirect('/auth/login');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.execute(
    'UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = NOW() WHERE id = ?',
    [hashed, userId]
  );

  req.session.user.must_change_password = false;
  return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
}

module.exports = {
  login,
  logout,
  changePassword
};
