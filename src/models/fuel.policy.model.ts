export { };

const mongoose = require('mongoose');

const FuelPolicySchema = new mongoose.Schema({
    threshold: Number,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('FuelPolicy', FuelPolicySchema);
