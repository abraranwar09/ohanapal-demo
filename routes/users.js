const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();

router.get('/', async (req, res) => {
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

router.patch('/', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const { userName, age, gender, assessmentSummary, isAssessmentComplete } = req.body;

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { $set: { userName, age, gender, assessmentSummary, isAssessmentComplete } },
            { new: true, runValidators: true, omitUndefined: true }
        );

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(401).send('Invalid token');
    }
});

module.exports = router;
