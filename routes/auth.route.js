const router = require('express').Router();
const { User } = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const { registerValidator } = require('../utils/validators');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('./../utils/email');

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
  '/request-reset',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user){
        req.flash(
          'error',
          'Could not find user associated with email'
        );
        return res.redirect('back');
      }

      const resetToken = await user.createResetPasswordToken();

      await user.save();

      const resetUrl = `${req.protocol}://${req.get('host')}/auth/resetPassword/${resetToken}`;

      const message = `We have recieved a password reset request. Click the link below to reset your password\n\n${resetUrl}`
      try {
        await sendEmail({
          email: user.email,
          subject: 'Password change request recieved',
          message: message
        });
        req.flash(
          'info',
          `Password reset request sent`
        );
        res.redirect('back');
    } catch(error) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save();
      console.error(error)
      req.flash('error', 'User not found');
      res.redirect('back');
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

// Route to display the password reset form
router.get('/resetPassword/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Find the user by the reset token and ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
    }

    // Render the password reset form (or redirect to a frontend page)
    res.render('resetPassword', { token, currentPage: 'resetPassword' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post(
  '/resetPassword/:token',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    const { token } = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const { newPassword } = req.body;
    const { confirm_password } = req.body;

    try{
      if (newPassword != confirm_password){
        req.flash('error', 'Passwords do not match')
        return res.redirect('back')
      }

      const user = await User.findOne({
        passwordResetToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
      });

      if (!user) {
      req.flash('error', 'Invalid or expired token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('info', 'Password updated');
    res.redirect('back')
    } catch(error) {
      next(error)
    }
  }
)


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