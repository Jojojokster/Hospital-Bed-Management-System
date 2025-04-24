if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// Import the modules we need
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const path = require('path');
const dotenv = require('dotenv');
const { ensureLoggedIn } = require('connect-ensure-login');
const cookieParser = require('cookie-parser');
const initializePassport = require('./utils/passport.auth.js');
const { roles } = require('./utils/constants.js');
const dbinit = require('./utils/dbinit.js');

// Load environment variables from .env file
dotenv.config({ path: './.env' });

// Create the express application object
const app = express();
const port = process.env.PORT || 8000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, httpOnly: true // 86400000 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth.js');

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define Routes
app.use('/', require('./routes/index.route.js'));
app.use('/auth', require('./routes/auth.route.js'));
app.use(
  '/user',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/user.route.js')
);
app.use(
  '/patientregister',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/moderator.route.js')
);
app.use(
  '/admin',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin,
  require('./routes/admin.route.js')
);
app.use(
  '/moderator',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin,
  require('./routes/moderator.route.js')
);

app.get('/', (req, res) => {
  console.log('User:', req.user);
  res.render('index');
});

// Tells Express how we should process html files
app.engine('html', ejs.renderFile);

// Helper function to validate environment variables
const validateEnv = () => {
    const requiredVars = ['DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE'];
    requiredVars.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Environment variable ${key} is not set`);
        }
    });
};

validateEnv();

// Define the database connection
const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Make the database connection available globally
global.db = db;

dbinit();

// Test the database connection
db.getConnection()
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.log(error);
    });

    // Initialize Passport
    initializePassport(
    passport, 
    async email => {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return results.length > 0 ? results[0] : null;
    },
    async id => {
        const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return results.length > 0 ? results[0] : null;
    }
);

// Handle logout
app.post("/logout", (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

function ensureAdmin(req, res, next) {
    if (req.user.role === roles.admin) {
      next();
    } else {
      req.flash('warning', 'you are not Authorized to see this route');
      res.redirect('/');
    }
  }
  
  function ensureModerator(req, res, next) {
    if (req.user.role === roles.moderator) {
      next();
    } else {
      req.flash('warning', 'you are not Authorized to see this route');
      res.redirect('/');
    }
  }