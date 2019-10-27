const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema({
    id_user: { type: Schema.ObjectId, ref: 'users' },
    message: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

module.exports = mongoose.model('comments', Comments);