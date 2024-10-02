export { };

const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    manufacturer: String,
    name: String,
    license: {
        type: String,
        required: 'Vehicle license plate is required.'
    },
    status: {
        type: String,
        default: 'Inactive'
    },
    driver: {
        type: String,
        default: 'Unassigned'
    },
    trip: {
        type: String,
        default: 'None'
    },
    source: {
        type: String,
        default: 'None'
    },
    destination: {
        type: String,
        default: 'None'
    },
    currentLocation: String,
    fuel: {
        type: Number,
        default: 0.6
    },
    standardConsumptionRate: Number,
    consumptionRate: Number,
    consumptionStatus: String,
    fuelCapacity: Number,
    sensorId: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
