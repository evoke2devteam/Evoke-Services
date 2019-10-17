const userModel = require('../models/UsersModel');

function approveTransaction(req, res) {
    res.status(200).send({ status: true, message: 'API ready' });
    userModel.findOne({ id_gg: req.body.addressfrom }, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Fail to find addres from' });
        } else if (data) {
            const addressfrom = data.id_bc;
            userModel.findOne({ id_gg: req.body.addressto }, (err2, data2) => {
                if (err2) {
                    res.status(500).send({ status: false, message: 'Fail to find addres to' });
                } else if (data2) {
                    const addressto = data2.id_bc;
                    const keyVault = async () => {
                        return await findKeyVault(addressfrom);
                    }
                    keyVault.call().then((result) => {
                        const privatekey = result.data.value;
                        const BCTransfer = async () => {
                            return await transferBlockchainApi(addressfrom, privatekey, addressto, req.body.amount);
                        }
                        BCTransfer.call().then((result2) => {
                            res.status(200).send({ status: true, message: 'Successful transaction' });
                        }).catch((err2) => {
                            res.status(500).send({ status: false, message: 'Fail in transaction', error: err2 });
                        });
                    }).catch((err) => {
                        res.status(500).send({ status: false, message: 'Fail to find secrte key', error: err });
                    });
                } else {
                    res.status(404).send({ status: false, message: 'Address to not found' });
                }
            });
        } else {
            res.status(404).send({ status: false, message: 'Address from not found' });
        }
    });
}

function balanceOf(req, res) {
    userModel.findOne({ id_gg: req.body.id }, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Fail to find id' });
        } else if (data) {
            const BCValanceOf = async () => {
                return await balanceOfAPI(data.id_bc);
            }
            BCValanceOf.call().then((result) => {
                res.status(200).send({ status: true, message: 'Successful transaction', data: result.balance });
            }).catch((err) => {
                res.status(500).send({ status: false, message: 'Fail to balance of', error: err });
            });
        } else {
            res.status(404).send({ status: false, message: 'Id not found' });
        }
    });
}

function findKeyVault(address) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://40.117.251.59:5002/show-key',
            data: JSON.stringify({
                id: address
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
                addressfrom: addressfrom,
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

function balanceOfAPI(address) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.14/evocoin/balanceOf',
            data: JSON.stringify({
                address: address
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
    approveTransaction,
    balanceOf
};