const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Create a connection pool to the MySQL database
const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Handle user registration
exports.register = async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body;

        // Validate input fields
        if (!name || !email || !password || !confirm_password) {
            return res.json({
                status: 'error',
                message: 'Please fill in all fields'
            });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.json({
                status: 'error',
                message: 'Passwords do not match'
            });
        }

        // Check if the email is already registered
        const [results] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (results.length > 0) {
            return res.json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Hash the password and insert the new user into the database
        const hashedPassword = await bcrypt.hash(password, 8);
        await db.query('INSERT INTO users SET ?', {
            name: name,
            email: email,
            password: hashedPassword
        });

        // Return success message
        return res.json({
            status: 'success',
            message: 'Registration successful!'
        });

    } catch (error) {
        console.log(error);
        return res.json({
            status: 'error',
            message: 'An error occurred'
        });
    }
};

// Handle user login
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'An error occurred'
            });
        }
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: info.message
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'An error occurred'
                });
            }
            req.session.user = user; // Store user information in session
            return res.status(200).json({
                status: 'success',
                message: 'Login successful!',
                redirect: '/' // Redirect to home page on success
            });
        });
    })(req, res, next);
};