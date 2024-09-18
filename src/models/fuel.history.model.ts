export { };

const mongoose = require('mongoose');

const FuelHistorySchema = new mongoose.Schema({
    // trip: String,
    driver: String,
    vehicle: String,
    fuel: Number,
    sensorId: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('FuelHistory', FuelHistorySchema);
