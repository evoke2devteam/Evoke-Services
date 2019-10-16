const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    id_gg: String,
    id_bc: String,
    id_sb: String,
    firstName: String,
    email: String,
    status: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

module.exports = mongoose.model('users', Users);