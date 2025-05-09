const router = require('express').Router();
const { User } = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const { registerValidator } = require('../utils/validators');
const bcrypt = require('bcryptjs');

router.get(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('login', { currentPage: 'login' });
  }
);

router.post(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  passport.authenticate('local', {
    // successRedirect: '/',
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.post(
  '/reset-pass',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });


    } catch {

    }
  }
)

router.post(
  '/update-password',
  ensureLoggedIn({ redirectTo: '/login' }),
  async (req, res, next) => {
    try {
      const { id, new_password, confirm_password, password } = req.body;

      const user = await User.findOne({ where: { id } });

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        if (password == confirm_password) {
          await user.update({
            password: new_password
          })
          req.flash(
            'info',
            `Password Updated`
          );
          res.redirect('/user/profile');
        } else {
          req.flash('error', 'Passwords do not match');
          res.redirect('back');
        }
      } else {
        req.flash('error', 'Password does not match current password');
        res.redirect('back');
      }
    } catch (error) {
      next(error)
    }
  } 
)

router.get(
  '/forgot-password',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('forgot-password', { currentPage: 'forgot-password' });
  }
)

router.get(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('register', { currentPage: 'register' });
  }
);

router.post(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        res.render('register', {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }

      const { email } = req.body;
      const doesExist = await User.findOne({ where: { email } });
      if (doesExist) {
        req.flash('warning', 'Username/email already exists');
        res.redirect('/auth/register');
        return;
      }
      const user = new User(req.body);
      await user.save();
      req.flash(
        'success',
        `${user.email} registered succesfully, you can now login`
      );
      res.redirect('/auth/login');
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/logout',
  ensureLoggedIn({ redirectTo: '/' }),
  async (req, res, next) => {
    req.logout();
    res.redirect('/');
  }
);

module.exports = router;