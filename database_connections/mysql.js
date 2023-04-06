const mysql = require('mysql2');
const bcrypt = require("bcryptjs");

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

class MysqlConsultor {
  constructor() { }

  insertUser(user, pass) {
    //To do: add salt complex
    var salt = "";
    var sql = 'INSERT INTO user values (?, ?, ?)';

    bcrypt.hash(pass, 10, (err, salt) => {
      connection.query(sql, [user, pass, salt], function (err, res, fields) {
        if (err) {
          console.log(err);
          return err;
        }
      });
      
      if (err) {
        console.log("Error: ", err);
      }
    });
  }

  async login(user, pass) {
    return new Promise(function (resolve, reject) {
      connection.query('SELECT * FROM `user` where `user` = ? and `pass` = ?',
        [
          user,
          pass
        ],
        function (error, results, fields) {
          if (results[0]) {
            bcrypt.compare(pass, results[0].salt, (err, match) => {
              if (err) {
                console.log("Error comprobando:", err);
              } else {
                if(match){ 
                  resolve(results[0]); 
                }
                else{
                  resolve(false);
                }
                //console.log("¿La contraseña coincide?: " + match);
              }
            });
          }
          else {
            resolve(false);
          }
        });
    })
  }
}

module.exports = MysqlConsultor;
