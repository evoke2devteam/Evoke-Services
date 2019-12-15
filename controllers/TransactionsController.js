const userModel = require('../models/UsersModel');
const request = require('request');

function approveTransaction(req, res) {
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
                        console.log(privatekey);
                        if (req.body.type == 'Evocoin') {
                            const BCTransferEvocoin = async () => {
                                return await transferEvocoinAPI(addressfrom, privatekey, addressto, req.body.amount);
                            }
                            BCTransferEvocoin.call().then((result2) => {
                                res.status(200).send({ status: true, message: 'Successful Evocoin transaction' });
                            }).catch((err2) => {
                                res.status(500).send({ status: false, message: 'Fail in Evocoin transaction', error: err2 });
                            });
                        } else if (req.body.type == 'Ruby') {
                            const BCTransferRuby = async () => {
                                return await transferRubyAPI(addressfrom, privatekey, addressto, req.body.amount);
                            }
                            BCTransferRuby.call().then(result3 => {
                                res.status(200).send({ status: true, message: 'Successful Ruby transaction' });
                            }).catch(err3 => {
                                res.status(500).send({ status: false, message: 'Fail in Ruby transaction', error: err3 });
                            });
                        } else {
                            res.status(400).send({ status: false, message: 'Invalid type of transaction' });
                        }
                    }).catch((err) => {
                        res.status(500).send({ status: false, message: 'Fail to find secrte key' });
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
    userModel.findOne({ id_moodle: req.body.id_moodle }, (err, data) => {
        if (err) {
            res.status(500).send({ status: false, message: 'Fail to find id' });
        } else if (data) {
            //console.log(data.id_bc);
            const BCBalanceOf = async () => {
                return await balanceOfAPI(data.id_bc);
            }
            //BCBalanceOfRuby = async () => {
            //    return await balanceOfAPIRuby(data.id_bc);
            //}
            BCBalanceOf.call().then((resultEvocoin) => {
                //BCBalanceOfRuby.call().then((resultRuby) => {
                res.status(200).send({ status: true, message: 'Successful balance', evocoin: resultEvocoin.evocoin });
                //}).catch((err3) => {
                //res.status(500).send({ status: false, message: 'Fail to balance of Rubies', error: err3 });
                //});
            }).catch((err2) => {
                res.status(500).send({ status: false, message: 'Fail to balance of Evocoin', error: err2 });
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
            json: {
                'id': address
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function transferEvocoinAPI(addressfrom, privatekey, addressto, amount) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/transfer',
            json: {
                addressfrom: addressfrom,
                privatekey: privatekey,
                addressto: addressto,
                amount: amount
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function getMissionScore(req, res) {
    core_completion_get_activities_completion_status(8, 6).then(data => {
        let arrayId1 = [];
        let arrayId2 = [];
        let arrayId3 = [];
        for (let i = 0; i < data.statuses.length; i++) {
            arrayId1.push(get_mission_score_reward(data.statuses[i].cmid, 1));
            arrayId2.push(get_mission_score_reward(data.statuses[i].cmid, 2));
            arrayId3.push(get_mission_score_reward(data.statuses[i].cmid, 3));
        }
        Promise.all(arrayId1).then(array1 => {
            Promise.all(arrayId2).then(array2 => {
                Promise.all(arrayId3).then(array3 => {
                    for (let i = 0; i < data.statuses.length; i++) {
                        data.statuses[i].reward_1 = array1[i].Reward;
                        data.statuses[i].reward_2 = array2[i].Reward;
                        data.statuses[i].reward_3 = array3[i].Reward;
                    }
                    res.status(200).send({ status: true, data });
                }).catch(err3 => {
                    console.log(err3);
                    res.status(500).send({ status: false, err3 });
                });
            }).catch(err2 => {
                console.log(err2);
                res.status(500).send({ status: false, err2 });
            });
        }).catch(err1 => {
            console.log(err1);
            res.status(500).send({ status: false, err1 });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).send({ status: false, err });
    });
}

function getMissionPaid(req, res) {
    get_mission_user_paid(req.body.mission_id, req.body.user).then(data => {
        res.status(200).send({ status: true, data });
    }).catch(err => {
        res.status(500).send({ status: false, error: err });
    });
}

async function setMissionScore(req, res) {
    set_mission_score_reward(req.body.mission_id, req.body.score, req.body.reward).then(data => {
        res.status(200).send({ status: true, message: data });
    }).catch(err => {
        res.status(500).send({ status: false, error: err });
    });
}

function payMissionScore(req, res) {
    login(req.body.user).then(data => { 
        console.log(data);
        const id_bc = data.data.id_bc;
        pay_mission_score_user(req.body.mission_id, req.body.score, id_bc).then(data => {
            res.status(200).send({ status: true, message: data });
        }).catch(err2 => {
            console.log(err2);
            res.status(500).send({ status: false, error: err2 });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).send({ status: false, error: 'Fallo al validar usuario' });
    });
}

/**
function transferRubyAPI(addressfrom, privatekey, addressto, amount) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/ruby/transfer',
            json: {
                addressfrom: addressfrom,
                privatekey: privatekey,
                addressto: addressto,
                amount: amount
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function balanceOfAPIRuby(address) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/ruby/balanceOf',
            json: {
                address: address
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

 */
function balanceOfAPI(address) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/balanceOf',
            json: {
                address: address
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

function get_mission_score_reward(mission, score) {
    return new Promise((res, rej) => {
        request.get({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/get_mission_score_reward',
            json: {
                mission_id: mission,
                score: score
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

function get_mission_user_paid(mission, user) {
    return new Promise((res, rej) => {
        request.get({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/get_mission_user_paid',
            json: {
                mission_id: mission,
                user: user
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    })
}

function set_mission_score_reward(mission, score, reward) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/set_mission_score_reward',
            json: {
                addressfrom: '0xe401862558e44fa2547b66a6c1d50c8492718997',
                privatekey: '57a29559e91df761c933986caf25debac5e21f4056d4487150cdcaab5cd37096',
                mission_id: mission,
                score: score,
                reward: reward
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

//user: '0xd7B61E052bacbb0CE0b9F8E932C2362574cFEf7C'
function pay_mission_score_user(mission, score, user) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/pay_mission_score_user',
            json: {
                addressfrom: '0xe401862558e44fa2547b66a6c1d50c8492718997',
                privatekey: '57a29559e91df761c933986caf25debac5e21f4056d4487150cdcaab5cd37096',
                mission_id: mission,
                score: score,
                user: user
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

function core_completion_get_activities_completion_status(idCurso, idUser) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://evoke-colombia.moodle.school/webservice/rest/server.php?wstoken=32764463f86f0ea1cfd1cdf4bb00ac7f&moodlewsrestformat=json&wsfunction=core_completion_get_activities_completion_status&courseid=${idCurso}&userid=${idUser}`,
            json: true
        }, (error, response, body) => {
            if (!error) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function login(id_moodle) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://40.117.251.59/account/login',
            json: {
                id_moodle: id_moodle
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

module.exports = {
    approveTransaction,
    balanceOf,
    getMissionScore,
    getMissionPaid,
    setMissionScore,
    payMissionScore
};