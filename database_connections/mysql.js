const mysql = require('mysql');
const crypto = require('crypto');
//const bcrypt = require("bcryptjs");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'datasets'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

function encrypt(text, key){
  var cipher = crypto.createCipher('aes-256-cbc', key)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text, key){
  var decipher = crypto.createDecipher('aes-256-cbc', key)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

class MysqlConsultor {
  constructor() { }

  insertUser(user, pass) {
    var salt = getRandomInt(1000,9999).toString();
    var passEnc = encrypt(pass, salt);
    var sql = 'INSERT INTO user values (?, ?, ?)';

    connection.query(sql, [user, passEnc, salt], function (err, res, fields) {
      if (err) {
        console.log(err);
        return err;
      }
    });
  }

  async login(user, pass) {
    return new Promise(function (resolve, reject) {
      connection.query('SELECT * FROM `user` where `user` = ?',
        [
          user
        ],
        function (error, results, fields) {
          if (results[0]) {
            var salt = results[0].salt;
            var passEnc = results[0].pass;

            if(pass == decrypt(passEnc, salt)){
              resolve(results[0]);
            }
            else{
              resolve(false);
            }
          }
          else {
            resolve(false);
          }
        });
    })
  }
}



module.exports = MysqlConsultor;
