export { };

const policyCtrl = require('../controllers/fuel.policy.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/fuelpolicy')
    .post(policyCtrl.createFuelPolicy)
    .put(policyCtrl.updateFuelPolicy)
    .get(policyCtrl.getFuelPolicy);

router.route('/api/v0/email')
    .post(policyCtrl.createEmailRecipient)
    .put(policyCtrl.updateEmailRecipient)
    .delete(policyCtrl.removeEmailRecipient);

router.route('/api/v0/emails')
    .get(policyCtrl.getEmailRecipients)

router.route('/api/v0/email/test')
    .get(policyCtrl.dispatchEmails);

module.exports = router;
