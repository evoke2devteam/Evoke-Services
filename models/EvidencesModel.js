const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Evidence = new Schema({
    id_gg_drive: String,
    name: String,
    description: String,
    id_gg: String,
    coments: [{ type: Schema.ObjectId, ref: 'comments' }],
    calification: { type: Number, default: 0 },
    id_mission: String,
    url: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

module.exports = mongoose.model('evidences', Evidence);