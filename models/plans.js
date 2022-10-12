const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    limit: { type: Number, required: true },
    price: { type: Number, require: true }
});

module.exports = mongoose.model('plans', PlanSchema);