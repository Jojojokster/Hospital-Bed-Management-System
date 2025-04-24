const { body } = require('express-validator');
module.exports = {
  registerValidator: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .trim()
      .isLength(2)
      .withMessage('Password length short, min 2 char required'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password do not match');
      }
      return true;
    }),
  ],
  patientValidator: [
    body('patient_forename').notEmpty().withMessage('First name is required'),
    body('patient_surname').notEmpty().withMessage('Last name is required'),
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('phone').notEmpty().withMessage('Phone number is required'),
  ],
};