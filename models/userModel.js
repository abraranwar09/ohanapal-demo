const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    isAssessmentComplete: {
        type: Boolean,
        default: false
    },
    userName: {
        type: String,
        default: ''
    },
    age: {
        type: Number,
        default: 0
    },
    gender: {
        type: String,
        default: ''
    },
    assessmentSummary: {
        type: String,
        default: ''
    },
    parsedLocation: {
        type: String,
        default: ''
    }
});

// Hash the password before saving the user model
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 