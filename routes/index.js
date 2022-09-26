const express = require('express');
const router = express.Router();
const userRouter = require('./users');
const roleRouter = require('./role');
const paymentRouter = require('./payment');

router.use('/users',userRouter);
router.use('/roles',roleRouter);
router.use('/payment',paymentRouter);


module.exports = router;
