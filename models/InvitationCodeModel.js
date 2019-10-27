const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationCode = new Schema({
    status: { type: Boolean, default: true },
    code: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

module.exports = mongoose.model('invitations', InvitationCode);