const mongoose = require('mongoose');

const UserPlansSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'plans' },
    is_expired: { type: Boolean, default: false },
    created_at: { type: Date, required: true }
});

module.exports = mongoose.model('user_plans', UserPlansSchema);