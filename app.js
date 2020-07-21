const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Load config
dotenv.config({path: './config/config.env'});

//Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Method override
app.use(methodOverride((req, res) => {
    if(req.body && typeof req.body == 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method;
        delete req.body.method;
        return method;
    }
}));


// Handlebards helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs');


// Handlebars
app.engine('.hbs', exphbs({helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');


// Sessions
app.use(session({
    secret: 'storyboard robb',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/storybooks', require('./routes/index'));
app.use('/storybooks/auth', require('./routes/auth'));
app.use('/storybooks/stories', require('./routes/stories'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`));

