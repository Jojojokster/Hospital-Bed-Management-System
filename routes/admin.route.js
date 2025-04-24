const { User } = require('../models/user.model'); // Import Sequelize User model
const router = require('express').Router();
const { roles } = require('../utils/constants');

// Route to fetch all users
router.get('/users', async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await User.findAll();
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

// Route to fetch a single user by ID
router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate if the ID is numeric
    if (!Number.isInteger(Number(id))) {
      req.flash('error', 'Invalid id');
      return res.redirect('/admin/users');
    }

    // Find the user by primary key
    const person = await User.findByPk(id, { // `findByPk` is Sequelize's method for finding by primary key
    attributes: ['id', 'email', 'role'],
    }); 

    if (!person) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    res.render('profile', { person , currentPage: 'profile' });
  } catch (error) {
    next(error);
  }
});

// Route to update a user's role
router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Check for required fields in the request body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Validate if the ID is numeric
    if (!Number.isInteger(Number(id))) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Validate the role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove themselves from the admin role
    if (req.user.id === Number(id)) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Update the user's role in the database
    const [updatedRowsCount] = await User.update(
      { role }, // Update the role field
      { where: { id } } // Find the user by ID
    );

    if (updatedRowsCount === 0) {
      req.flash('error', 'User not found');
      return res.redirect('back');
    }

    // Fetch the updated user to display the success message
    const updatedUser = await User.findByPk(id);
    req.flash('info', `Updated role for ${updatedUser.email} to ${updatedUser.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

module.exports = router;