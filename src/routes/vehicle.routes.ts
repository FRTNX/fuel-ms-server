export { };

const vehicleCtrl = require('../controllers/vehicle.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/vehicle')
    .post(vehicleCtrl.create)
    .get(vehicleCtrl.read)
    .put(vehicleCtrl.update)
    .delete(vehicleCtrl.remove);

router.route('/api/v0/vehicle/consumption')
    .get(vehicleCtrl.getFuelConsumptionHistory);

router.route('/api/v0/vehicles')
    .get(vehicleCtrl.readAll)

router.route('/api/v0/sensor')
    .get(vehicleCtrl.getFuelHistory)
    .post(vehicleCtrl.recordSensorData);

router.route('/api/v0/sensors/ping')
    .get(vehicleCtrl.launchSensorSimulators);

router.route('/api/v0/ping')
    .get(vehicleCtrl.ping);

// called by cron job every <interval>
router.route('/api/v0/fuel/consumption')
    .get(vehicleCtrl.monitorFuelConsumption)

module.exports = router;
