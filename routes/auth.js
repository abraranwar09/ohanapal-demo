const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    const token = jwt.sign({ id: req.user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.redirect(`/?token=${token}&accessToken=${req.user.accessToken}`);
});

router.post('/signup', async (req, res) => {
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

module.exports = router;
