const InvitationCode = require('../models/InvitationCodeModel');

function generateCode(req, res) {
    InvitationCode.create({ code: makeCode(20) }, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Fail to generate code' });
        } else {
            res.status(200).send({ status: true, message: 'Code generate successfully' })
        }
    });
}

function checkCode(req, res) {
    InvitationCode.findOne({ code: req.body.code }, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Fail to check code' });
        } else if (data) {
            if (data.status) {
                InvitationCode.updateOne({ code: req.body.code }, { status: false }, (errUpdate, dataUpdate) => {
                    if (errUpdate) {
                        res.status(500).send({ status: false, message: 'Fail to update the status code' });
                    } else {
                        res.status(200).send({ status: true, message: 'Code valid' });
                    }
                });
            } else {
                res.status(200).send({ status: false, message: 'The code was already used' })
            }
        } else {
            res.status(404).send({ status: false, message: 'Code not found' });
        }
    });
}


function makeCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    generateCode,
    checkCode
}