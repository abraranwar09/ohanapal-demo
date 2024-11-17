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

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    const token = jwt.sign({ id: req.user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.redirect(`/?token=${token}`); // Redirect with token as a query parameter
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const newUser = new User({ email, password });
        await newUser.save();
        const token = jwt.sign({ id: newUser.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).send('Error creating user: ' + error.message);
    }
});

app.get('/api/user', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findById(decoded.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(401).send('Invalid token');
    }
});

// Create a WebSocket server on the same port
const wss = new WebSocketServer({ server: app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}) });

wss.on('connection', (clientSocket) => {
    console.log('Client connected to proxy WebSocket.');

    // Connect to OpenAI Realtime API
    const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    const openAISocket = new WebSocket(openAIUrl, {
        headers: {
            "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
            "OpenAI-Beta": "realtime=v1",
        },
    });

    openAISocket.on('open', () => {
        console.log('Connected to OpenAI Realtime API.');
    });

    openAISocket.on('message', (message) => {
        console.log('Message from OpenAI:', message.toString());
        // Relay message from OpenAI to client
        clientSocket.send(message);
    });

    clientSocket.on('message', (message) => {
        console.log('Message from client:', message.toString());
        // Check if the OpenAI WebSocket is open before sending
        if (openAISocket.readyState === WebSocket.OPEN) {
            openAISocket.send(message);
        } else {
            console.error('OpenAI WebSocket is not open. Message not sent.');
        }
    });

    clientSocket.on('close', () => {
        console.log('Client disconnected.');
        openAISocket.close();
    });

    openAISocket.on('close', () => {
        console.log('Disconnected from OpenAI.');
        clientSocket.close();
    });

    openAISocket.on('error', (error) => {
        console.error('OpenAI WebSocket error:', error);
    });

    clientSocket.on('error', (error) => {
        console.error('Client WebSocket error:', error);
    });
});



