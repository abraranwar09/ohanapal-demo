const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/userModel');

router.get('/google', passport.authenticate('google', {
    scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/calendar', 
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
    ],
    accessType: 'offline',
    prompt: 'consent'
}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    const token = jwt.sign({ id: req.user.id }, 'your_jwt_secret');
    console.log(req.user);
    res.redirect(`/?token=${token}&accessToken=${req.user.accessToken}&refreshToken=${req.user.refreshToken}`);
});

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const newUser = new User({ email, password });
        await newUser.save();
        const token = jwt.sign({ id: newUser.id }, 'your_jwt_secret');
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).send('Error creating user: ' + error.message);
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id }, 'your_jwt_secret');
        res.json({ token });
    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
});

module.exports = router;
