const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const process = require('process'); // To handle graceful shutdown
const { User } = require('../models/user.model');

// Structured logging setup (replace this with winston/pino in production)
const logError = (err) => {
    console.error(`[${new Date().toISOString()}]`, err);
};


function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            // Sanitize email input and query only required fields
            const [results] = await db.query('SELECT id, email, password FROM users WHERE email = ?', [email.trim()]);
            const user = results[0];

            if (!user) {
                return done(null, false, { message: 'Invalid email or password' }); // Generic error message
            }

            // Compare the provided password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, { id: user.id, email: user.email }); // Return only necessary user fields
            } else {
                return done(null, false, { message: 'Invalid email or password' });
            }
        } catch (err) {
            logError(err);
            return done(err);
        }
    };

    passport.use(
        new LocalStrategy({ usernameField: 'email' }, authenticateUser)
    );

    passport.serializeUser((user, done) => {
        done(null, user.id); // Serialize only the user ID
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            if (user) {
                done(null, user);
            } else {
                done(null, null); // Handle case where user is not found
            }
        } catch (err) {
            logError(err);
            done(err);
        }
    });
}

// Shutdown of the connection pool
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    try {
        await db.end();
        console.log('Database connection pool closed.');
    } catch (err) {
        logError(err);
    } finally {
        process.exit(0);
    }
});

module.exports = initialize;
