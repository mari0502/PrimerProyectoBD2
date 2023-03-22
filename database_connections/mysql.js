const mysql = require('mysql');

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

class MysqlConsultor{
  constructor(){}

  insertUser(user, pass){
    //To do: add salt complex
    var salt = pass + "me";
    var sql = 'INSERT INTO user values (?, ?, ?)';
    connection.query(sql, [user, pass, salt], function(err, res, fields) {
      if(err){
        console.log(err);
        return err;
      }
    });
  }

  async login(user, pass){
    var sql = 'SELECT * FROM user WHERE user = ? and pass = ?';
    const res = await connection.query(sql, [user, pass], function(err, res, fields) {
      if(err){
        console.log(err);
        return err;
      }
      if(res[0]){
        return true;
      }
      else{
        return false;
      }
    });
    return res;
  }
}

module.exports = MysqlConsultor;
