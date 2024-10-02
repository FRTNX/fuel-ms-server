export { };

const mongoose = require('mongoose');

const ConsumptionRecordSchema = new mongoose.Schema({
    recordNumber: Number,
    vehicle: {
        type: String,
        required: 'Vehicle parameter is required.'
    },
    driver: String,
    fuel: {
        type: Number,
        required: 'Current fuel reading is required.'
    },
    diff: {
        type: Number,
        required: 'Difference between current and previous reading is required'
    },
    status: {
        type: String,
        required: 'Consumption status is required.'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('ConsumptionRecord', ConsumptionRecordSchema);

ConsumptionRecordSchema.pre('save', function(next) {
    // updated recordNumber based on previous
})