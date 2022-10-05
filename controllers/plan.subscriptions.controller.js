const PlanModel = require('../models/plans');
const { __parse } = require('../shared/helper');

async function createSubscriptionPlan(req, res, next) {

    try {
        const { name, upload_limit, price } = req.body;
        const planModelData = new PlanModel({ name, limit: upload_limit, price: price })
        const createdPlan = __parse(await planModelData.save());
        res.status(200).json({ message: "success", result: { data: createdPlan } });

    } catch (error) {
        res.status(401).json({ message: error?.message });
    }
}

async function updateSubscriptionPlan(req,res,next) {

    try {
        const { plan_id , limit , price  } = req.body;
        await PlanModel.findByIdAndUpdate(
            { _id: plan_id },
            { limit: limit, ...(price && { price: price }) }
        );
        res.status(200).json({ message: 'success', result: { data: {} } })

    } catch (error) {
        res.status(401).json({ message: error?.message });
    }
 }

async function deleteSubscriptionPlan() { }

module.exports = {
    createSubscriptionPlan,
    updateSubscriptionPlan
}