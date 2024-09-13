export { };

const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
   source: String,
   destination: String,
   vehicle: String,
   driver: String,
   fuel: Number,
   status: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('Trip', TripSchema);
