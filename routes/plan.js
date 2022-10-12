const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/plan.subscriptions.controller');


router.post('/add-plan',PlanController.createSubscriptionPlan);
router.post('/update-plan',PlanController.updateSubscriptionPlan);

module.exports = router;
