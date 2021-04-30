// todo
const uuid = require('uuid/v1');
var db = require('../database/config');
var express = require('express');
var router = express.Router();
// todo
const ROOT = '/';
const GET_SEARCH = '/get/search';
const POST_UPDATE = '/post/update';
const GET_UPDATE = '/get/update';
const POST_LOGIN = '/post/login';
const POST_LOGOUT = '/post/logout';
const POST_START = '/post/start';
const POST_UNDO = '/post/undo';
const GET_TEST = '/get/test';
const POST_TEST = '/post/test';
const POST_ECHO = '/post/echo';
const POST_TSYNC = '/post/tsync';

const USER_ID = 1;

/**
 * Database Diagram.
 * Car's & User's data are stored directly in the code since they are unique..
 *  
 *                  ------------       ------------       ------------
 *                 | states     |     | sessions   |     | requests   |
 *                  ------------       ------------       ------------
 *                 | id         |     | id         |     | id         |
 *                 | state      |     | uuid       |     | timestamp  |-----users(id=1, username='segula', password='53gu14')
 * Cars(id=42)-----| timestamp  |     | idUser     |     | mission    |   |      (id=1, username='test', password='123')
 *             |   | lat        |     | idCar      |     | isWaiting  |   |       
 *             |   | lng        |      ------------      | idUser     |   |
 *             |   | idCar      |        |      |         ------------    |
 *             |    ------------         |      |_________________________|
 *             |_________________________|
 *                                          
 */

// todo
router.get(ROOT, function(req, res, next) {
    res.statusCode = 200;
    res.render('test', {title: 'CAR Simulator'});
});

//todo
router.get(GET_TEST, function(req, res, next) {
    return res.status(200).send("test ok");
});

//todo
router.post(POST_TEST, function(req, res, next) {
    var key = Object.keys(req.body);
    var value = req.body['test'];
    
    res.statusCode = 200;

    if (value) {
        return res.send(value + " was affected to " + key);
    } else {
        return res.send("Can't find...");
    }
});

router.post('/post/event', function(req, res, next) {
    var id = req.body['id'];
    return res.send("id=" + id);
});

//todo
router.post(POST_ECHO, function(req, res, next) {

    var idCar = req.body['idCar'];
    var state = req.body['state'];
    var timestamp = req.body['timestamp'];
    var lat = req.body['lat'];
    var lng = req.body['lng'];
    var tsync = req.body['tsync'];
    
    res.statusCode = 200;
    return res.send(idCar + ", " + state + ", " + timestamp  + ", " + lat + ", " + lng + ", " + tsync);
});

//todo
router.post(POST_TSYNC, function(req, res, next) {

    var timestamp = req.body['timestamp'];

    var date = new Date();
    var myTimestamp = date.getTime();
    var delta = myTimestamp - parseInt(timestamp, 10);

    res.statusCode = 200;
    return res.send("timestamp=" + myTimestamp + ",delta=" + delta);
});

// todo
router.get(GET_SEARCH, function(req, res, next) {
    
    res.statusCode = 200;

    findMission(function(err, request) {        
        if (request != -1) {  
            affectMission(request.id, function(err) {
                if (!err) {
                    res.json({
                        err: false,
                        msg: 'A new mission found.',
                        data: {mission: request.mission, idUser: request.idUser}
                    });
                } else {
                    res.json({
                        err: true,
                        msg: JSON.stringify(err),
                        data: {code: 3}
                    });
                }
            });
        } else {
            if (request == -1) {
                res.json({
                    err: true,
                    msg: 'No mission found',
                    data: {code: 2}
                });
            } else {
                res.json({
                    err: true,
                    msg: JSON.stringify(err),
                    data: {code: 1}
                });   
            }            
        }
    });
});

// todo
router.post(POST_UPDATE, function(req, res, next) {

    var state  = {
        idCar : req.body['idCar'],
        state : req.body['state'],
        timestamp : req.body['timestamp'],
        lat : req.body['lat'],
        lng : req.body['lng']        
    };

    db.execute('INSERT INTO states SET ?', state, function (err) {        
        res.statusCode = 200;
        res.json({
            error: err? true : false,
            msg: err? JSON.stringify(err) : 'OK',
            data: {state}
        });
    });
});

// todo
router.get(GET_UPDATE, function(req, res, next) {

    const uuid = req.headers['uuid'];
    res.statusCode = 200;

    isExistSession(uuid, function(err, isExist) {
        if (isExist != null && isExist) {
            getCarsState(function (err, data) {
                if (data != null && data.length > 0) {    
                    res.json({
                        err: false,
                        msg: 'Last known values.',
                        data: {car: data}
                    });
                } else {    
                    if (dataSize == 0) {
                        res.json({
                            err: true,
                            msg: 'No data found.',
                            data: {code: 4}
                        });
                    } else {
                        res.json({
                            err: true,
                            msg: JSON.stringify(err),
                            data: {code: 3}
                        });
                    }
                }
            });
        } else {
            if (!isExist) {
                res.json({
                    err: true,
                    msg: 'Access denied.',
                    data: {code: 2}
                });
            } else {
                res.json({
                    err: true,
                    msg: JSON.stringify(err),
                    data: {code: 1}
                });
            }
        }
    });
});

// todo
router.post(POST_LOGIN, function (req, res) {

    var username = req.body['username'];
    var password = req.body['password'];
    res.statusCode = 200;

    if (isFound(username, password)) {
        disconnect(USER_ID, function(err) {
            if (!err) {
                generateUuid(USER_ID, function(id) {
                    if (id != null) {
                        res.json({
                            err: false,
                            msg: 'User loged in',
                            data: {idUser: USER_ID, idSession: id}
                        });
                    } else {
                        res.json({
                            err: true,
                            msg: 'Can\'t initialize session.',
                            data: {code: 3}
                        });
                    }
                });
            } else {
                res.json({
                    err: true,
                    msg: JSON.stringify(err),
                    data: {code: 2}
                });
            }
        });        
    } else {
        res.json({
            err: true,
            msg: 'User not found.',
            data: {code: 1}
        });
    }
});

// todo
router.post(POST_LOGOUT, function (req, res) {

    var idUser = req.body['idUser'];
    res.statusCode = 200;

    disconnect(idUser, function(err) {
        res.json({
            err: err? true : false,
            msg: err? JSON.stringify(err) : 'User loged out.',
            data: {}
        });
    }); 
});

// todo
router.post(POST_START, function (req, res) {

    var timestamp = req.body['timestamp'];
    var idSession = req.body['idSession'];
    var mission = req.body['mission'];
    res.statusCode = 200;

    isExistUser(idSession, function(err, nbSessions) {
        if (!err) {
            if (nbSessions == 1) {
                makeRequest(timestamp, mission, USER_ID, function(err, id) {
                    if (!err) {
                        res.json({
                            err: false,
                            msg: 'Success',
                            data: {idRequest: id}
                        });
                    } else {
                        res.json({
                            err: true,
                            msg: JSON.stringify(err),
                            data: {code: 3}
                        });
                    }
                });
            } else {
                res.json({
                    err: true,
                    msg: "Can't find session.",
                    data: {code: 2}
                }); 
            }
        } else {
            res.json({
                err: true,
                msg: JSON.stringify(err),
                data: {code: 1}
            });
        }
    });
});

// todo
router.post(POST_UNDO, function (req, res) {

    var id = req.body['idMission'];
    res.statusCode = 200;

    removeRequest(id, function(err) {
        res.json({
            err: err? true : false,
            msg: err? JSON.stringify(err) : 'Undo request.',
            data: {}
        });
    });
});


/**
 * todo
 * @param {*} callback 
 */
function findMission(callback) {
    db.execute('SELECT * FROM requests WHERE timestamp IN (SELECT MIN(timestamp) FROM requests WHERE isWaiting = 1);', null, function (err, res) {    
        callback(err, err? null: (res.length > 0? res[0]: -1));
    });
}

/**
 * todo
 * @param {*} id 
 * @param {*} callback 
 */
function affectMission(id, callback) {
    db.execute('UPDATE requests SET isWaiting = 0 WHERE id = ?', id, function (err) {        
        callback(err);
    });
}

/**
 * todo
 * @param {*} uuid 
 * @param {*} callback 
 */
function isExistSession(uuid, callback) {
    db.execute('SELECT COUNT(id) AS nbSessoins FROM sessions WHERE BINARY uuid = ?', uuid, function (err, res) {        
        callback(err, err? null: res[0].nbSessoins);
    });
}

/**
 * todo
 * @param {*} callback 
 */
function getCarsState(callback) {

    const request = 
        'SELECT DISTINCT states.idCar, timestamp, state, lat, lng ' +
        'FROM states ' +
        'INNER JOIN ' +
        '   (SELECT idCar, MAX(timestamp) AS maxTime ' +
        '   FROM states ' +
        '   GROUP BY idCar) grouped ' +
        'ON states.idCar = grouped.idCar ' +
        'AND states.timestamp = grouped.maxTime;';
    
    db.execute(request, null, function (err, res) {        
        callback(err, err? null: res);             
    });
}

/**
 * todo
 * @param {*} idUser 
 * @param {*} callback 
 */
function disconnect(idUser, callback) {
    db.execute('DELETE FROM sessions WHERE sessions.idUser = ?;', idUser, function (err) { 
        callback(err);
    });
}

/**
 * todo
 * @param {String} username 
 * @param {String} password 
 */
function isFound(username, password) {
    return username == 'SegulaS_01' && password == 'LabCar_S01'
        || username == 'SegulaS_02' && password == 'LabCar_S02'
        || username == 'SegulaS_03' && password == 'LabCar_S03'
        || username == 'SegulaS_04' && password == 'LabCar_S04'
        || username == 'SegulaS_DEV' && password == 'admin237'
        || username == 'a' && password == 'a';
}

/**
 * todo
 * @param {*} idUser 
 * @param {*} callback 
 */
function generateUuid(idUser, callback) {
    const idSession = uuid();
    var data = {uuid: idSession, idUser: idUser};
    db.execute('INSERT INTO sessions SET ?', data, function (err) { 
        callback(err? null: idSession);
    });
}

/**
 * todo
 * @param {*} idSession 
 * @param {*} callback 
 */
function isExistUser(idSession, callback) {
    db.execute('SELECT COUNT(*) AS nbSessions FROM sessions WHERE sessions.uuid = ?', idSession, function (err, res) { 
        callback(err, err? null: res[0].nbSessions);
    });
}


/**
 * todo
 * @param {*} timestamp 
 * @param {*} mission 
 * @param {*} idUser 
 * @param {*} callback 
 */
function makeRequest(timestamp, mission, idUser, callback) {
    var data = {timestamp: timestamp, mission: mission, idUser: idUser};
    db.execute('INSERT INTO requests SET ?; SELECT LAST_INSERT_ID() AS last', data, function (err, allRes) {
        var res = allRes[1]; 
        callback(err, res[0].last);
    });
}

/**
 * todo
 * @param {*} id 
 * @param {*} callback 
 */
function removeRequest(id, callback) {
    db.execute('DELETE FROM requests WHERE id = ?', id, function (err) {
        callback(err);
    });
}

module.exports = router;