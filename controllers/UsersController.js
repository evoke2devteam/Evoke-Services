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
                    id_bc: data.id_bc,
                    id_moodle: data.id_moodle
                },
                token: Auth.createToken(req.body.id_gg)
            });
        } else {
            const userBC = async () => {
                return await userBlockchainAPI();
            }
            userBC.call().then((result) => {
                //console.log(result);
                const keyVault = async () => {
                    return await keyVaultAPI(result.address, result.privateKey.substr(2));
                }
                keyVault.call().then((result2) => {
                    if (result2.status) {
                        const createUserMoodle = async () => {
                            return await createUserMoodleAPI(req.body.email, req.body.firstName, req.body.lastName, result.privateKey);
                        }
                        createUserMoodle.call().then(dataMoodle => {
                            UserModel.create({
                                id_gg: req.body.id_gg,
                                id_bc: result.address,
                                id_moodle: dataMoodle[0].id,
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
                                            id_moodle: data2.id_moodle
                                        },
                                        token: Auth.createToken(req.body.id_gg)
                                    });
                                }
                            });
                        }).catch(err => {
                            res.status(500).send({ status: false, message: 'Fail to create a Moodle user', error: err })
                        });
                    } else {
                        res.status(500).send({ status: false, message: result2.message });
                    }
                }).catch((err2) => {
                    res.status(500).send({ status: false, message: 'Fail to save private key', error: err2 });
                });
            }).catch((err) => {
                //console.log(err);
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

function createUserMoodleAPI(email, firstName, lastName, password) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://evoke.moodlecloud.com/webservice/rest/server.php?wstoken=db948bcd784b9b857dc527007526e0e6&moodlewsrestformat=json&wsfunction=core_user_create_users&users[0][username]=${email}&users[0][email]=${email}&users[0][lastname]=${lastName}&users[0][firstname]=${firstName}&users[0][password]=${password}`,
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
    login
};