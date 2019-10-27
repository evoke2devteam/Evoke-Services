const EvidenceModel = require('../models/EvidencesModel');
const CommentModel = require('../models/CommentsModel');
const UserModel = require('../models/UsersModel');
const mongoose = require('mongoose');

function createEvidence(req, res) {
    EvidenceModel.create(req.body, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Error to create a evidence' });
        } else {
            res.status(200).send({ status: true, message: "Evidence created successfully" });
        }
    });
}

function createComment(req, res) {
    UserModel.findOne({ id_gg: req.body.id_gg }, (errUser, dataUser) => {
        if (errUser) {
            res.status(500).send({ status: false, message: 'Error to find a user' });
        } else if (dataUser) {
            CommentModel.create({
                id_user: mongoose.Types.ObjectId(dataUser._id),
                message: req.body.message
            }, (errComment, dataComment) => {
                if (errComment) {
                    res.status(500).send({ status: false, message: 'Error to create a comment' });
                } else {
                    EvidenceModel.updateOne({
                        id_gg: req.body.id_gg,
                        id_gg_drive: req.body.id_gg_drive,
                        id_mission: req.body.id_mission
                    }, {
                        $push: {
                            coments:
                            {
                                $each: [mongoose.Types.ObjectId(dataComment._id)]
                            }
                        }
                    }, (errEvidence, dataEvidence) => {
                        console.log(dataEvidence);     
                        if (errEvidence) {
                            res.status(500).send({ status: false, message: 'Error associating comment with evidence' });
                        } else if (dataEvidence.nModified > 0) {
                            res.status(200).send({status: true, message: 'Comment created successfully'});
                        } else {
                            res.status(404).send({ status: false, message: 'Evidence not found' });
                        }
                    });
                }
            });
        } else {
            res.status(404).send({ status: false, message: 'User not found' });
        }
    });
}

module.exports = {
    createEvidence,
    createComment
}