const mongoose = require('mongoose');

const UserStorageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        created_at: { type: Date, required: true }
    }
);

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    verified: { type: Number, default: 0 },
    status: { type: Number, default: 1 },
    payment_status: { type: Number, default: 0 },
    files: [
       UserStorageSchema
    ]
});

module.exports = mongoose.model('users', UserSchema);