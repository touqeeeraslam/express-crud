const express = require('express');
const router = express.Router();
const userRouter = require('./users');
const roleRouter = require('./role');
const paymentRouter = require('./payment');
const planRouter = require('./plan');

router.use('/users',userRouter);
router.use('/roles',roleRouter);
router.use('/payment',paymentRouter);
router.use('/plans',planRouter);

module.exports = router;
