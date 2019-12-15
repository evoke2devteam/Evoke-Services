const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    id_bc: String,
    id_moodle: Number,
    status: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

module.exports = mongoose.model('users', Users);