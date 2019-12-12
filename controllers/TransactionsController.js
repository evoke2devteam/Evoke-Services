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
                        } else if(req.body.type == 'Ruby'){
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

function getMissionScore(req,res){
    res.status(200).send({ status: true, message: 'API Works' });
}

function getMissionPaid(req,res){
    res.status(200).send({ status: true, message: 'API Works' });
}

function setMissionScore(req,res){
    res.status(200).send({ status: true, message: 'API Works' });
}

function payMissionScore(req,res){
    res.status(200).send({ status: true, message: 'API Works' });
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

function get_mission_score_reward(mission, score){
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

function get_mission_user_paid(mission, user){
    return new Promise((res, rej) => {
        request.get({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/get_mission_user_paid',
            json: {
                mission_id: mission,
                user: user
            }  
        },  (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    })
}

function set_mission_score_reward(mission, score, reward){
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
function pay_mission_score_user(mission, score, user){
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/set_mission_score_reward',
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

module.exports = {
    approveTransaction,
    balanceOf,
    getMissionScore,
    getMissionPaid,
    setMissionScore,
    payMissionScore
};