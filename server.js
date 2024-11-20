const express = require('express');
const path = require('path');
require('dotenv').config();
const connectDB = require('./server_utils/db');
const User = require('./models/userModel');
const bodyParser = require('body-parser');
const passport = require('passport');
require('./server_utils/passport-setup');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const WebSocketServer = require('ws').Server;
const { writeFileSync } = require('node:fs');
const OpenAI = require('openai');
const openai = new OpenAI();
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' }); // Set the destination for uploaded files
const SessionMessage = require('./models/sessionMessageModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Middleware to parse JSON bodies
// app.use(bodyParser.json());
// Increase the limit to 10MB (or any size you need)
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


// Initialize session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true
}));

//health check
app.get('/health', (req, res) => {
    res.send('OK');
});

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const audioRoutes = require('./routes/audio');
const googleRoutes = require('./routes/google');
const locationRoutes = require('./routes/location');
const perplexityRoutes = require('./routes/perplexity');


// Use the routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/audio', audioRoutes);
app.use('/google', googleRoutes);
app.use('/location', locationRoutes);
app.use('/perplexity', perplexityRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



