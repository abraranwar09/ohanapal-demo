const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isAssementComplete: {
        type: Boolean,
        default: false
    },
    assessmentData: {
        type: Object,
        default: {}
    },
    interpreterProfile: {
        type: Object,
        default: {}
    },
    userName: {
        type: String,
        default: ''
    },
    age: {
        type: Number,
        default: 0
    },
    parsedLocation: {
        type: String,
        default: ''
    }



});

const User = mongoose.model('User', userSchema);

module.exports = User; 