/*var log4js = require('log4js');

log4js.configure({
    appenders: { fileAppender: { type: 'file', filename: './logs/logger.log' } },
    categories: { default: { appenders: ['fileAppender'], level: 'error' } }
});
const logger = log4js.getLogger();*/

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug'; // default level is OFF - which means no logs at all.
logger.debug("Some debug messages");

var mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit: 10,
    multipleStatements: true,
    host: 'localhost',
    user: 'devuser',
    password: 'diab_st%19',
    database: 'labcar_db'
});

exports.execute = function(request, param, doSomething) {

    db.getConnection(function(err, connection) {
        if (!err) {
            connection.query(request, param, function(err, result) {
                connection.release();                                
                doSomething(err, result);            
            });
        } else {
            //logger.error('SQL Error : ' + err);
            //console.log('SQL Error : ' + err);
        }
    });
};