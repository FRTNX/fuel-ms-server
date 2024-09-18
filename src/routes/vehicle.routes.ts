export { };

const vehicleCtrl = require('../controllers/vehicle.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/vehicle')
    .post(vehicleCtrl.create)
    .get(vehicleCtrl.read)
    .put(vehicleCtrl.update)
    .delete(vehicleCtrl.remove);

router.route('/api/v0/vehicles')
    .get(vehicleCtrl.readAll)

router.route('/api/v0/sensor')
    .get(vehicleCtrl.getFuelHistory)
    .post(vehicleCtrl.recordSensorData);

router.route('/api/v0/ping')
    .get(vehicleCtrl.ping);

module.exports = router;
