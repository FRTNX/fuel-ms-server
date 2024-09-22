export { };

const mongoose = require('mongoose');

const EmailRecipientSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'User name is required'
    },
    email: {
        type: String,
        trim: true,
        unique: 'Email already exists',
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: 'Email is required'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('EmailRecipient', EmailRecipientSchema);
