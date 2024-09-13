export { };

const driverCtrl = require('../controllers/driver.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/driver')
    .post(driverCtrl.create)
    .get(driverCtrl.read)
    .put(driverCtrl.update);

router.route('/api/v0/drivers')
    .get(driverCtrl.readAll)

module.exports = router;
