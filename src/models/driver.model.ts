export { };

const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    fullname: String,
    nationalId: String,
    nationality: String,
    passportNumber: String,
    permitNumber: String,
    license: { number: String, class: Number},
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('Driver', DriverSchema);
