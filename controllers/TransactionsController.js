const userModel = require('../models/UsersModel');

function approveTransaction(req, res) {
    res.status(200).send({ status: true, message: 'API ready' });
    userModel.findOne({ id_gg: req.body.addressfrom }, (err, data) => {
        
    });
}

function findKeyVault(address){
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://40.117.251.59:5002/show-key',
            data: JSON.stringify({
                id : address
            }),
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function transferBlockchainApi(addressfrom, privatekey, addressto, amount) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.14/evocoin/transfer',
            data: JSON.stringify({
                addressfrom : addressfrom,
                privatekey: privatekey, 
                addressto: addressto, 
                amount: amount
            }),
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}


module.exports = {
    approveTransaction
};