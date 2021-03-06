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

async function getMissionPaid(req, res) {
    //console.log(req.body.user);
    try {
        const id_bc = await userModel.findOne({ id_moodle: req.body.user });
        if (id_bc) {
            get_mission_user_paid(req.body.mission_id, id_bc.id_bc).then(data => {
                if (data.Paid == 0) {
                    res.status(200).send({ status: true, data, paid_status: false }); 
                } else {
                    res.status(200).send({ status: true, data, paid_status: true }); 
                }
            }).catch(err => {
                res.status(500).send({ status: false, error: err });
            });
        } else {
            res.status(404).send({ status: false, message: 'User not Foud', paid_status: false });
        }
    } catch (e) {
        res.status(500).send({ status: false, message: 'Fail to consult user' })
    }
}

async function setMissionScore(req, res) {
    login(req.body.admin).then(data_admin => {
        const id_bc_admin = data_admin.data.id_bc;
        findKeyVault(id_bc_admin).then(private => {
            const private_key = private.data.value;
            set_mission_score_reward(id_bc_admin, private_key, req.body.mission_id, req.body.score, req.body.reward).then(data => {
                res.status(200).send({ status: true, message: data });
            }).catch(err => {
                console.log("Fallo BC");
                res.status(500).send({ status: false, error: err });
            });
        }).catch(err2 => {
            console.log("Fallo al private key");
            res.status(500).send({ status: false, error: err2 });
        });
    }).catch(err1 => {
        console.log("Fallo al buscar admin");
        res.status(500).send({ status: false, error: err1 });
    });
}

function payMissionScore(req, res) {
    login(req.body.user).then(data_user => {
        //console.log(data_user);
        const id_bc_user = data_user.data.id_bc;
        login(req.body.admin).then(data_admin => {
            const id_bc_admin = data_admin.data.id_bc;
            findKeyVault(id_bc_admin).then(private => {
                const private_key = private.data.value;
                pay_mission_score_user(id_bc_admin, private_key, req.body.mission_id, req.body.score, id_bc_user).then(data => {
                    res.status(200).send({ status: true, message: data });
                }).catch(err2 => {
                    console.log(err2);
                    res.status(500).send({ status: false, error: err2 });
                });
            }).catch(err4 => {
                console.log(err4);
                res.status(500).send({ status: false, error: err4 });
            });
        }).catch(err3 => {
            console.log(err3);
            res.status(500).send({ status: false, error: err3 });
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

function set_mission_score_reward(addressfrom, privatekey,  mission, score, reward) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/set_mission_score_reward',
            json: {
                addressfrom: addressfrom,
                privatekey: privatekey,
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

function pay_mission_score_user(addressfrom, privatekey, mission, score, user) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/pay_mission_score_user',
            json: {
                addressfrom: addressfrom,
                privatekey: privatekey,
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