
const { stripe } = require('../config/stripe.config');
const User = require('../models/user');

async function changeUserPaymentStatus(req, res, next) {

    try {

        const { user_id } = req.body;
        const changedPaymentStatus = await User.findByIdAndUpdate(
            {
                _id: user_id
            },
            {
                payment_status: 1
            }
        );

        res.status(200).json({ message: 'success', result: { data: {} } });

    } catch (error) {
        res.status(401).json({ message: error?.message });
    }
}

async function createCheckOutSession(req, res) {

    try {
        const {price , name}   = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name:name,
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: process.env.SUCCESS_URL || 'http://localhost:4200/#/refund/payment-success',
            cancel_url: process.env.CANCEL_URL || 'http://localhost:4200/#/refund/payment-cancel',
        });
        
        res.status(200).json({ message: 'success', result: { data: session } });

    } catch (error) {
        res.status(401).json({ message: error?.message });
    }
}

module.exports = {
    changeUserPaymentStatus,
    createCheckOutSession
}