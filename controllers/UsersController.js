const UserModel = require('../models/UsersModel');
const Auth = require('../middleware/Auth');
const request = require('request');

function login(req, res) {
    UserModel.findOne({ id_gg: req.body.id_gg }, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Faild to find user' });
        } else if (data) {
            res.status(200).send({
                status: true,
                data: {
                    id_gg: data.id_gg,
                    id_bc: data.id_bc,
                    id_sb: data.id_sb
                },
                token: Auth.createToken(req.body.id_gg)
            });
        } else {
            const userBC = async () => {
                return await userBlockchainAPI();
            }
            userBC.call().then((result) => {
                console.log(result);
                const keyVault = async () => {
                    return await keyVaultAPI(result.address, result.privateKey.substr(2));
                }
                keyVault.call().then((result2) => {
                    if (result2.status) {
                        UserModel.create({
                            id_gg: req.body.id_gg,
                            id_bc: result.address,
                            id_sb: makeRandom(9),
                            firstName: req.body.firstName,
                            email: req.body.email
                        }, (err2, data2) => {
                            if (err2) {
                                res.status(500).send({ status: false, message: 'Faild to create a user' });
                            } else {
                                res.status(200).send({
                                    status: true,
                                    data: {
                                        id_bc: data2.id_bc,
                                        id_sb: data2.id_sb
                                    },
                                    token: Auth.createToken(req.body.id_gg)
                                });
                            }
                        });   
                    } else {
                        res.status(500).send({ status: false, message: result2.message });
                    }
                }).catch((err2) => {
                    res.status(500).send({ status: false, message: 'Fail to save private key', error: err2 });
                });
            }).catch((err) => {
                console.log(err);
                res.status(500).send({ status: false, message: 'Faild to create a BC user', error: err });
            });
        }
    });
}

function userBlockchainAPI() {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/user/create_account',
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

function keyVaultAPI(address, secret) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://40.117.251.59:5002/create-key',
            body: {
                'name': address,
                'value': secret
            },
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    })
}


function makeRandom(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    login
};